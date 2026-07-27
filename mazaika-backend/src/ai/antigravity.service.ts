import { Injectable, Logger } from '@nestjs/common';
import { ROUTING_AGENT_PROMPT, BOT_AGENT_PROMPT, WEBAPP_AGENT_PROMPT } from './prompts';

export interface GenerateDto {
  prompt: string;
  currentHtml?: string;
  imageBase64?: string;
  imageMimeType?: string;
}

@Injectable()
export class AntigravityService {
  private readonly logger = new Logger(AntigravityService.name);

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

      if (typeof rawInput === 'string') {
        promptText = rawInput;
      } else if (typeof rawInput === 'object' && rawInput !== null) {
        promptText = rawInput.prompt || rawInput.message || rawInput.text || rawInput.promptText || '';
        existingHtml = rawInput.currentHtml || rawInput.html || rawInput.siteHtml || rawInput.currentConfig?.source_code || rawInput.currentConfig?.html || '';
        imageBase64 = rawInput.imageBase64 || '';
        imageMimeType = rawInput.imageMimeType || 'image/jpeg';
        if (rawInput.chatHistory?.length > 0) chatHistory = rawInput.chatHistory;
        if (rawInput.targetEntity) targetEntity = rawInput.targetEntity;
      }

      if (!existingHtml && currentConfig) {
        existingHtml = currentConfig.source_code || currentConfig.html || '';
      }

      const googleKey = (
        rawInput?.googleKey ||
        process.env.GOOGLE_AI_STUDIO_KEY ||
        process.env.GEMINI_API_KEY ||
        ''
      ).trim();

      if (!googleKey) {
        throw new Error('No API key provided.');
      }

      // Step 1: Routing Agent
      let target = targetEntity;
      if (!target) {
        const routeRes = await this.callGemini(googleKey, ROUTING_AGENT_PROMPT, promptText, '', '', 0, true);
        if (routeRes && routeRes.target) {
          target = routeRes.target === 'bot_only' ? 'bot_and_mini_app' : routeRes.target; 
        } else {
          target = 'bot_and_mini_app'; // Default
        }
      }

      this.logger.log(`🚀 Routing determined target: ${target}`);

      // Base context
      const historyContext = chatHistory.length > 0
        ? `\n\nPrevious conversation:\n${chatHistory.slice(-5).map(m => `${m.role === 'user' ? 'User' : 'Antigravity'}: ${m.content}`).join('\n')}\n`
        : '';

      const isEditMode = existingHtml.trim().length > 50;

      // Parallel Agents
      let botData: any = null;
      let siteData: any = null;

      const userRequest = `USER REQUEST: "${promptText}"\n${historyContext}`;

      if (target === 'site_only') {
        siteData = await this.callGemini(googleKey, WEBAPP_AGENT_PROMPT, userRequest, imageBase64, imageMimeType, 0, false);
      } else if (target === 'bot_and_mini_app') {
        const tasks = [
          this.callGemini(googleKey, BOT_AGENT_PROMPT, userRequest, imageBase64, imageMimeType, 0, false),
          this.callGemini(googleKey, WEBAPP_AGENT_PROMPT, userRequest, imageBase64, imageMimeType, 0, false)
        ];
        
        const [botRes, siteRes] = await Promise.all(tasks);
        botData = botRes;
        siteData = siteRes;
      }

      // Combine Results
      const finalResult = {
        type: target === 'site_only' ? 'site' : 'bot_and_mini_app',
        execution_mode: 'FULL_GENERATION',
        target_entity: target,
        title: 'AI Generated Project',
        explanation: siteData?.explanation || botData?.explanation || 'Generatsiya yakunlandi!',
        html: siteData?.html || existingHtml,
        source_code: siteData?.html || existingHtml,
        website_html: siteData?.html || existingHtml,
        project_data: {
          target_entity: target,
          source_code: siteData?.html || existingHtml,
          html: siteData?.html || existingHtml,
          bot_blocks: botData?.bot_blocks || currentConfig?.bot_blocks || [],
          bot_edges: botData?.bot_edges || currentConfig?.bot_edges || [],
          bot_code: botData?.bot_code || ''
        }
      };

      return finalResult;

    } catch (error: any) {
      this.logger.error(`Fatal Service Error: ${error.message}`);
      return {
        type: 'site',
        execution_mode: 'FULL_GENERATION',
        target_entity: 'site_only',
        title: 'Error',
        explanation: 'Xatolik yuz berdi. Qayta urinib koring.',
        html: rawInput?.currentHtml || ''
      };
    }
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

    const fileRegex = /<file\s+path=["']([^"']+)["']>([\s\S]*?)<\/file>/gi;
    let match;
    let hasFiles = false;
    while ((match = fileRegex.exec(text)) !== null) {
      files[match[1]] = match[2].trim();
      hasFiles = true;
    }

    if (hasFiles) {
      jsonText = text.replace(/<file\s+path=["']([^"']+)["']>([\s\S]*?)<\/file>/gi, '').trim();
    }

    jsonText = jsonText.replace(/\`\`\`json/gi, '').replace(/\`\`\`/gi, '').trim();
    
    let parsedJson: any = null;
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonCandidate = jsonText.substring(firstBrace, lastBrace + 1);
      try {
        const cleaned = jsonCandidate.replace(/,\s*([\]}])/g, '$1');
        parsedJson = JSON.parse(cleaned);
      } catch (e) {
        this.logger.warn('JSON Parse failed');
      }
    }

    if (!parsedJson) parsedJson = {};

    if (hasFiles) {
      parsedJson.files = files;
      if (files['index.html']) {
        parsedJson.html = files['index.html'];
      }
    }

    return parsedJson;
  }
}
