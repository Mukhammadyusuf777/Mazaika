import { Injectable, Logger } from '@nestjs/common';
import { ROUTING_AGENT_PROMPT, BOT_AGENT_PROMPT, WEBAPP_AGENT_PROMPT, WEBAPP_PATCH_PROMPT, BOT_PATCH_PROMPT } from './prompts';
import { MazaikaDbService } from '../cloud/mazaika-db.service';

export interface GenerateDto {
  prompt: string;
  currentHtml?: string;
  imageBase64?: string;
  imageMimeType?: string;
}

@Injectable()
export class AntigravityService {
  private readonly logger = new Logger(AntigravityService.name);

  constructor(private readonly mazaikaDb: MazaikaDbService) {}

  /**
   * Applies an array of SEARCH/REPLACE text patches to the source code.
   * Returns the patched code, or the original code if a patch fails to match.
   */
  private applyWebPatches(sourceCode: string, patches: Array<{ search: string; replace: string }>): string {
    let result = sourceCode;
    let appliedCount = 0;

    for (const patch of patches) {
      if (!patch.search || !patch.replace) continue;

      const idx = result.indexOf(patch.search);
      if (idx !== -1) {
        result = result.substring(0, idx) + patch.replace + result.substring(idx + patch.search.length);
        appliedCount++;
        this.logger.log(`✅ Patch applied (search length: ${patch.search.length})`);
      } else {
        this.logger.warn(`⚠️ Patch search string NOT FOUND in source. Patch skipped.`);
      }
    }

    this.logger.log(`🔧 Applied ${appliedCount}/${patches.length} patches`);
    return result;
  }

  /**
   * Applies structural patches to a bot's nodes and edges arrays.
   */
  private applyBotPatches(currentBlocks: any[], currentEdges: any[], patchResult: any): { blocks: any[]; edges: any[] } {
    let blocks = [...(currentBlocks || [])];
    let edges = [...(currentEdges || [])];

    // Add new nodes
    if (patchResult.add_nodes?.length) {
      blocks = [...blocks, ...patchResult.add_nodes];
    }
    // Modify existing nodes
    if (patchResult.modify_nodes?.length) {
      for (const modified of patchResult.modify_nodes) {
        const idx = blocks.findIndex(b => b.id === modified.id);
        if (idx !== -1) blocks[idx] = modified;
      }
    }
    // Remove nodes
    if (patchResult.remove_node_ids?.length) {
      blocks = blocks.filter(b => !patchResult.remove_node_ids.includes(b.id));
    }
    // Add edges
    if (patchResult.add_edges?.length) {
      edges = [...edges, ...patchResult.add_edges];
    }
    // Remove edges
    if (patchResult.remove_edge_ids?.length) {
      edges = edges.filter(e => !patchResult.remove_edge_ids.includes(e.id));
    }

    this.logger.log(`🔧 Bot patch: +${patchResult.add_nodes?.length || 0} nodes, ~${patchResult.modify_nodes?.length || 0} modified, -${patchResult.remove_node_ids?.length || 0} removed`);
    return { blocks, edges };
  }

  async generate(rawInput: any): Promise<any> {
    return this.generateFullProject(rawInput);
  }

  async generatePatch(promptText: string, currentPageUrl?: string, selectedBlockId?: string | null, currentConfig?: any) {
    return this.generateFullProject(promptText, [], currentConfig, 'bot_and_mini_app');
  }

  async generateFullProject(
    rawInput: any,
    chatHistory: any[] = [],
    currentConfig?: any,
    targetEntity?: 'bot_and_mini_app' | 'site_only'
  ): Promise<any> {
    try {
      let promptText = '';
      let existingHtml = '';
      let imageBase64 = '';
      let imageMimeType = 'image/jpeg';
      let projectState: any = null;

      if (typeof rawInput === 'string') {
        promptText = rawInput;
      } else if (typeof rawInput === 'object' && rawInput !== null) {
        promptText = rawInput.prompt || rawInput.message || rawInput.text || rawInput.promptText || '';
        existingHtml = rawInput.currentHtml || rawInput.html || rawInput.siteHtml || rawInput.currentConfig?.source_code || rawInput.currentConfig?.html || '';
        imageBase64 = rawInput.imageBase64 || '';
        imageMimeType = rawInput.imageMimeType || 'image/jpeg';
        projectState = rawInput.projectState || rawInput.currentConfig?.project_state || null;
        if (rawInput.chatHistory?.length > 0) chatHistory = rawInput.chatHistory;
        if (rawInput.targetEntity) targetEntity = rawInput.targetEntity;
      }

      if (!existingHtml && currentConfig) {
        existingHtml = currentConfig.source_code || currentConfig.html || '';
        projectState = projectState || currentConfig.project_state || null;
      }

      const googleKey = (
        rawInput?.googleKey ||
        process.env.GOOGLE_AI_STUDIO_KEY ||
        process.env.GEMINI_API_KEY ||
        ''
      ).trim();

      // Determine if this is an EDIT (patch mode) or a NEW generation (full mode)
      const isEditMode = existingHtml.trim().length > 50;

      // Step 1: Routing Agent
      let target = targetEntity;
      if (!target) {
        const routeRes = await this.callAI(ROUTING_AGENT_PROMPT, promptText, '', '', 0, true, googleKey);
        if (routeRes && routeRes.target) {
          target = routeRes.target === 'bot_only' ? 'bot_and_mini_app' : routeRes.target;
        } else {
          target = 'bot_and_mini_app'; // Default
        }
      }

      this.logger.log(`🚀 Routing: target=${target} | mode=${isEditMode ? 'PATCH' : 'FULL'}`);

      // Build context: conversation history (compact, last 5 messages)
      const historyContext = chatHistory.length > 0
        ? `\n\nCONVERSATION HISTORY (last 5 messages):\n${chatHistory.slice(-5).map(m => `${m.role === 'user' ? 'User' : 'Antigravity'}: ${m.content}`).join('\n')}\n`
        : '';

      // Build PROJECT_STATE context to prevent Context Drift
      const stateContext = projectState
        ? `\n\nPROJECT ARCHITECTURE & CONTEXT (do NOT deviate from this):\n${JSON.stringify(projectState, null, 2)}\n`
        : '';

      let botData: any = null;
      let siteData: any = null;

      if (isEditMode) {
        // === PATCH MODE: surgical edits ===
        const userRequestForPatch = `USER REQUEST: "${promptText}"${historyContext}${stateContext}

CURRENT SITE CODE (apply patches to this):
\`\`\`html
${existingHtml.substring(0, 12000)}${existingHtml.length > 12000 ? '\n... (truncated for token limit)' : ''}
\`\`\``;

        const currentBotBlocks = rawInput?.currentConfig?.bot_blocks || [];
        const currentBotEdges = rawInput?.currentConfig?.bot_edges || [];
        const userRequestForBotPatch = `USER REQUEST: "${promptText}"${historyContext}${stateContext}

CURRENT BOT FLOW (apply patches to this):
Bot Nodes: ${JSON.stringify(currentBotBlocks.slice(0, 20))}
Bot Edges: ${JSON.stringify(currentBotEdges.slice(0, 20))}`;

        if (target === 'site_only') {
          siteData = await this.callAI(WEBAPP_PATCH_PROMPT, userRequestForPatch, imageBase64, imageMimeType, 0, false, googleKey);
        } else {
          const tasks = [
            this.callAI(BOT_PATCH_PROMPT, userRequestForBotPatch, '', '', 0, false, googleKey),
            this.callAI(WEBAPP_PATCH_PROMPT, userRequestForPatch, imageBase64, imageMimeType, 0, false, googleKey)
          ];
          const [botPatch, sitePatch] = await Promise.all(tasks);
          botData = botPatch;
          siteData = sitePatch;
        }

        // Apply patches to existing code
        let finalHtml = existingHtml;
        if (siteData?.patches?.length > 0) {
          finalHtml = this.applyWebPatches(existingHtml, siteData.patches);
        } else if (siteData?.html) {
          // Fallback: AI returned full HTML even in patch mode (e.g. first time or DeepSeek fallback)
          finalHtml = siteData.html;
          this.logger.warn('⚠️ AI returned full HTML in patch mode. Accepting full HTML as fallback.');
        }

        // Apply bot patches
        let finalBotBlocks = currentBotBlocks;
        let finalBotEdges = currentBotEdges;
        if (botData && (botData.add_nodes || botData.modify_nodes || botData.remove_node_ids)) {
          const patched = this.applyBotPatches(currentBotBlocks, currentBotEdges, botData);
          finalBotBlocks = patched.blocks;
          finalBotEdges = patched.edges;
        } else if (botData?.bot_blocks) {
          finalBotBlocks = botData.bot_blocks;
          finalBotEdges = botData.bot_edges || currentBotEdges;
        }

        const updatedProjectState = siteData?.project_state || botData?.project_state || projectState;

        const finalResult = {
          type: target === 'site_only' ? 'site' : 'bot_and_mini_app',
          execution_mode: 'PATCH',
          target_entity: target,
          title: 'AI Patched Project',
          explanation: siteData?.explanation || botData?.explanation || 'Muvaffaqiyatli yangilandi!',
          analysis: siteData?.analysis || botData?.analysis || '',
          html: finalHtml,
          source_code: finalHtml,
          website_html: finalHtml,
          project_state: updatedProjectState,
          project_data: {
            target_entity: target,
            source_code: finalHtml,
            html: finalHtml,
            bot_blocks: finalBotBlocks,
            bot_edges: finalBotEdges,
            bot_code: botData?.bot_code || rawInput?.currentConfig?.bot_code || '',
            project_state: updatedProjectState
          }
        };

        return finalResult;

      } else {
        // === FULL GENERATION MODE: create from scratch ===
        const userRequest = `USER REQUEST: "${promptText}"${historyContext}`;

        if (target === 'site_only') {
          siteData = await this.callAI(WEBAPP_AGENT_PROMPT, userRequest, imageBase64, imageMimeType, 0, false, googleKey);
        } else if (target === 'bot_and_mini_app') {
          const tasks = [
            this.callAI(BOT_AGENT_PROMPT, userRequest, imageBase64, imageMimeType, 0, false, googleKey),
            this.callAI(WEBAPP_AGENT_PROMPT, userRequest, imageBase64, imageMimeType, 0, false, googleKey)
          ];
          const [botRes, siteRes] = await Promise.all(tasks);
          botData = botRes;
          siteData = siteRes;
        }

        const newProjectState = siteData?.project_state || botData?.project_state || null;

        const finalResult = {
          type: target === 'site_only' ? 'site' : 'bot_and_mini_app',
          execution_mode: 'FULL_GENERATION',
          target_entity: target,
          title: 'AI Generated Project',
          explanation: siteData?.explanation || botData?.explanation || 'Generatsiya yakunlandi!',
          html: siteData?.html || existingHtml,
          source_code: siteData?.html || existingHtml,
          website_html: siteData?.html || existingHtml,
          project_state: newProjectState,
          project_data: {
            target_entity: target,
            source_code: siteData?.html || existingHtml,
            html: siteData?.html || existingHtml,
            bot_blocks: botData?.bot_blocks || currentConfig?.bot_blocks || [],
            bot_edges: botData?.bot_edges || currentConfig?.bot_edges || [],
            bot_code: botData?.bot_code || '',
            project_state: newProjectState
          }
        };

        // Mazaika Cloud Core: Automatically host the generated site
        if (finalResult.html) {
          const slug = promptText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 20) || 'default-site';
          await this.mazaikaDb.save('global', `site_${slug}`, finalResult);
          finalResult.explanation += `\n\n🌐 Sening sayting Mazaika Cloud'da tayyor: /cloud/sites/${slug}`;
        }

        return finalResult;
      }

    } catch (error: any) {
      this.logger.error(`Fatal Service Error: ${error.message}`);
      return {
        type: 'site',
        execution_mode: 'ERROR',
        target_entity: 'site_only',
        title: 'Error',
        explanation: 'Xatolik yuz berdi. Qayta urinib koring.',
        html: rawInput?.currentHtml || rawInput?.currentConfig?.html || ''
      };
    }
  }


  private async callAI(
    systemInstruction: string,
    userPrompt: string,
    imageBase64: string,
    imageMimeType: string,
    attempt: number,
    jsonMode: boolean,
    googleKey: string
  ): Promise<any> {
    if (googleKey) {
      return this.callGemini(googleKey, systemInstruction, userPrompt, imageBase64, imageMimeType, attempt, jsonMode);
    }
    const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
    const cfApiToken = process.env.CLOUDFLARE_API_TOKEN || '';
    if (!cfAccountId || !cfApiToken) {
       throw new Error('No API key provided for either Gemini or Cloudflare.');
    }
    return this.callCloudflareAI(cfAccountId, cfApiToken, systemInstruction, userPrompt);
  }

  private async callCloudflareAI(
    accountId: string,
    apiToken: string,
    systemInstruction: string,
    userPrompt: string
  ): Promise<any> {
    const models = [
      '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
      '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      '@cf/meta/llama-3.1-70b-instruct',
      '@cf/qwen/qwen1.5-14b-chat'
    ];

    for (const model of models) {
      try {
        const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 8192
          })
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.result?.choices?.[0]?.message?.content || data.result?.response;
          if (text) {
            const parsed = this.extractJsonObjectWithSelfHeal(text);
            if (parsed) {
              this.logger.log(`✅ Cloudflare Workers AI (${model}) succeeded!`);
              return parsed;
            }
          }
        } else {
          const errText = await res.text().catch(() => '');
          this.logger.warn(`Cloudflare AI ${model} HTTP ${res.status}: ${errText.substring(0, 150)}`);
        }
      } catch (e: any) {
        this.logger.warn(`Cloudflare AI ${model} error: ${e.message}`);
      }
    }
    return null;
  }

  private async callGemini(
    apiKey: string,
    systemInstruction: string,
    userPrompt: string,
    imageBase64: string,
    imageMimeType: string,
    attempt: number,
    jsonMode: boolean
  ): Promise<any> {
    const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
    const temperature = attempt === 0 ? 0.7 : 0.3;

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const parts: any[] = [{ text: `${systemInstruction}\n\n${userPrompt}` }];
        if (imageBase64 && imageBase64.length > 10) {
          parts.push({
            inline_data: {
              mime_type: imageMimeType || 'image/jpeg',
              data: imageBase64
            }
          });
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              temperature,
              maxOutputTokens: 16384
            }
          })
        });

        if (!res.ok) {
          this.logger.warn(`Gemini API Error: ${res.status}`);
          continue;
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) continue;

        const parsed = this.extractJsonObjectWithSelfHeal(text);
        if (parsed) return parsed;
        
      } catch (e: any) {
        this.logger.warn(`Gemini ${model} Error: ${e.message}`);
      }
    }

    // Self Healing retry
    if (attempt === 0) {
      this.logger.warn('Self-healing retry triggered');
      return this.callGemini(apiKey, systemInstruction, userPrompt, imageBase64, imageMimeType, 1, jsonMode);
    }

    return null;
  }

  private extractJsonObjectWithSelfHeal(text: string): any {
    if (!text) return null;

    let jsonText = text;
    let files: Record<string, string> = {};

    // 1. Extract <file path="...">...</file> blocks if they exist
    const fileRegex = /<file\s+path=["']([^"']+)["']>([\s\S]*?)<\/file>/gi;
    let match;
    let hasFiles = false;
    while ((match = fileRegex.exec(text)) !== null) {
      files[match[1]] = match[2].trim();
      hasFiles = true;
    }

    // 2. Remove the file blocks from the text to isolate the JSON metadata
    if (hasFiles) {
      jsonText = text.replace(/<file\s+path=["']([^"']+)["']>([\s\S]*?)<\/file>/gi, '').trim();
    }

    // 3. Clean up markdown wrappers
    jsonText = jsonText.replace(/\`\`\`json/gi, '').replace(/\`\`\`/gi, '').trim();
    
    // Attempt to parse JSON
    let parsedJson: any = null;
    
    // Find the first '{' and the last '}' in the remaining text
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonCandidate = jsonText.substring(firstBrace, lastBrace + 1);
      try {
        // Fix trailing commas often made by LLMs
        const cleaned = jsonCandidate.replace(/,\s*([\]}])/g, '$1');
        parsedJson = JSON.parse(cleaned);
      } catch (e) {
        this.logger.warn('JSON Parse failed on first attempt: ' + e);
      }
    }

    let htmlPart = '';

    // If it STILL failed, maybe it's just raw HTML returned by mistake?
    if (!parsedJson) {
      parsedJson = {
        type: 'site',
        execution_mode: 'FULL_GENERATION',
        target_entity: 'site_only',
        explanation: 'Sayt muvaffaqiyatli yaratildi!'
      };
      
      if (!hasFiles) {
        // If no JSON and no files, treat the entire output as HTML (legacy fallback)
        let rawHtml = text.replace(/^```html\s*/i, '').replace(/```\s*$/i, '').trim();
        
        // Self-heal: extract just the HTML part if it's mixed with conversational text
        const fallbackMatch = rawHtml.match(/(?:<!DOCTYPE html>\s*)?<html[\s\S]*/i);
        if (fallbackMatch) {
          htmlPart = fallbackMatch[0];
          parsedJson.explanation = isRawRussian(text) ? rawHtml.replace(fallbackMatch[0], '').trim() || 'Код готов!' : rawHtml.replace(fallbackMatch[0], '').trim() || 'Kod tayyor!';
        } else {
          htmlPart = rawHtml;
        }
        
        parsedJson.html = htmlPart;
        parsedJson.source_code = htmlPart;
      }
    } else {
      // If parsedJson was successful and has html inside it, we use it for truncation detection
      htmlPart = parsedJson.html || parsedJson.source_code || parsedJson.website_html || '';
      
      // Self-heal: Llama 3.3 sometimes puts the entire HTML inside the 'explanation' field
      if (!htmlPart && typeof parsedJson.explanation === 'string' && parsedJson.explanation.includes('<html')) {
        const fallbackMatch = parsedJson.explanation.match(/(?:<!DOCTYPE html>\s*)?<html[\s\S]*/i);
        if (fallbackMatch) {
          htmlPart = fallbackMatch[0];
          parsedJson.source_code = htmlPart;
          parsedJson.html = htmlPart;
          // Clean up the explanation
          parsedJson.explanation = parsedJson.explanation.replace(fallbackMatch[0], '').trim();
          if (!parsedJson.explanation) {
            parsedJson.explanation = isRawRussian(text) ? 'Готово! Код сгенерирован.' : 'Tayyor! Kod yaratildi.';
          }
        }
      }
    }

    // Merge extracted files into parsedJson
    if (hasFiles) {
      parsedJson.files = files;
      if (files['index.html']) {
        parsedJson.html = files['index.html'];
        parsedJson.source_code = files['index.html'];
        htmlPart = files['index.html'];
      }
      
      // Inject files into ecosystem components if applicable
      if (parsedJson.ecosystem && Array.isArray(parsedJson.ecosystem.components)) {
        parsedJson.ecosystem.components.forEach((comp: any) => {
          if (comp.source_file && files[comp.source_file]) {
            comp.source_code = files[comp.source_file];
          }
        });
      }
    }

    // Truncation detection & Auto-Closer for safe rendering
    let hasMore = false;
    
    if (htmlPart && htmlPart.toLowerCase().includes('<html')) {
      const lowerHtml = htmlPart.toLowerCase();
      if (!lowerHtml.includes('</html>')) {
        hasMore = true;
        this.logger.warn('⚠️ HTML was truncated by token limit. Auto-closing tags & setting has_more=true');
        
        if (lowerHtml.lastIndexOf('<style') > lowerHtml.lastIndexOf('</style>')) {
          htmlPart += '\n</style>';
        }
        if (lowerHtml.lastIndexOf('<script') > lowerHtml.lastIndexOf('</script>')) {
          htmlPart += '\n</script>';
        }
        if (!lowerHtml.includes('</body>')) {
          htmlPart += '\n</body>';
        }
        htmlPart += '\n</html>';
        parsedJson.explanation = isRawRussian(text)
          ? '⚡ Я создал основную структуру и первые страницы! Нажмите кнопку "Продолжить генерацию", чтобы я достроил остальные разделы!'
          : '⚡ Saytning asosiy qismi yaratildi! Qolgan sahifa va bo\'limlarni qo\'shish uchun "Davom ettirish" tugmasini bosing!';
      }
      
      if (hasFiles && files['index.html']) {
        parsedJson.files['index.html'] = htmlPart;
      }
      parsedJson.html = htmlPart;
      parsedJson.source_code = htmlPart;
    } else if (text) {
      // Cloudflare AI fallback: if Llama just talks and says 'continue'
      const lowerText = text.toLowerCase();
      if (lowerText.includes('continue') || lowerText.includes('продолжить') || lowerText.includes('davom ettirish')) {
        hasMore = true;
      }
    }
    
    if (hasMore) {
      parsedJson.has_more = true;
      // Force FULL_GENERATION so frontend saves it in activeConfig
      parsedJson.execution_mode = 'FULL_GENERATION';
      parsedJson.target_entity = 'site_only';
    }

    if (hasFiles && Object.keys(files).length > 0) {
      let combinedHtml = files['index.html'] || files['index.tsx'] || '';
      if (combinedHtml) {
        combinedHtml = combinedHtml.replace(/^```[a-z]*\s*/im, '').replace(/```\s*$/m, '');
        const cssContent = files['style.css'] || files['index.css'] || files['styles.css'];
        const jsContent = files['script.js'] || files['main.js'] || files['app.js'];
        
        if (cssContent && combinedHtml.includes('</head>')) {
           const cleanCss = cssContent.replace(/^```[a-z]*\s*/im, '').replace(/```\s*$/m, '');
           combinedHtml = combinedHtml.replace('</head>', `<style>\n${cleanCss}\n</style>\n</head>`);
        }
        
        if (jsContent && combinedHtml.includes('</body>')) {
           const cleanJs = jsContent.replace(/^```[a-z]*\s*/im, '').replace(/```\s*$/m, '');
           combinedHtml = combinedHtml.replace('</body>', `<script>\n${cleanJs}\n</script>\n</body>`);
        }
        
        parsedJson.html = combinedHtml; // Overwrite the monolith htmlPart
        parsedJson.source_code = combinedHtml;
      }
    }

    return parsedJson;
  }
}

function isRawRussian(rawInput: any): boolean {
  const text = typeof rawInput === 'string' ? rawInput : (rawInput?.prompt || '');
  return /[а-яА-ЯёЁ]/.test(text);
}
