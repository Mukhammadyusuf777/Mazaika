import { Injectable, Logger } from '@nestjs/common';

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

  async generateFullProject(
    rawInput: any,
    chatHistory: any[] = [],
    currentConfig?: any,
    targetEntity: 'bot_and_mini_app' | 'site_only' = 'bot_and_mini_app'
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

      const isUzbek = /[ўғҳа-я]/i.test(promptText) && !/[ыэъ]/i.test(promptText);
      const isRussian = /[а-яА-ЯёЁ]/.test(promptText);
      const userLang = isUzbek ? 'UZBEK' : (isRussian ? 'RUSSIAN' : 'ENGLISH');
      const lowerPrompt = promptText.toLowerCase();

      const hasImage = Boolean(imageBase64 && imageBase64.length > 10);

      const SITE_KEYWORDS = ['сайт', 'sayt', 'магазин', 'magazin', 'landing', 'лендинг', 'shop', 'store', 'web', 'веб'];
      const EDIT_KEYWORDS = ['измени', 'поменяй', 'добавь', 'убери', 'цвет', 'фон', 'текст', 'o\'zgartir', 'qo\'sh', 'olib tashla', 'rang', 'fon'];
      const BOT_KEYWORDS = ['bot', 'бот', 'нода', 'сценарий', 'flow', 'scenario', 'blok', 'блок', 'tugma', 'кнопка'];

      const isExplicitSite = SITE_KEYWORDS.some(k => lowerPrompt.includes(k));
      const isEditKeyword = EDIT_KEYWORDS.some(k => lowerPrompt.includes(k));
      const hasExistingHtml = Boolean(existingHtml && existingHtml.trim().length > 50);

      let isSiteRequest = targetEntity === 'site_only';
      let isBotRequest = targetEntity === 'bot_and_mini_app';

      // Fallback if targetEntity is somehow not definitive
      if (!isSiteRequest && !isBotRequest) {
        isBotRequest = BOT_KEYWORDS.some(k => lowerPrompt.includes(k)) && !isExplicitSite;
        isSiteRequest = isExplicitSite || hasExistingHtml || (hasImage && !isBotRequest);
      }

      const historyContext = chatHistory.length > 0
        ? `\n\nPrevious conversation:\n${chatHistory.slice(-5).map(m => `${m.role === 'user' ? 'User' : 'Antigravity'}: ${m.content}`).join('\n')}\n`
        : '';

      const isEditMode = hasExistingHtml;

      const imageInstruction = hasImage
        ? `\n\nIMPORTANT: The user has attached an IMAGE. Analyze it carefully — it may be a design reference, screenshot, sketch, or diagram. Use it to understand what they want to create or replicate.`
        : '';

      const CONTINUE_KEYWORDS = ['продолжи', 'продолжить', 'дальше', 'допиши', 'продолжение', 'dovom', 'continue', 'more', 'добавь страницу'];
      const isContinuationMode = CONTINUE_KEYWORDS.some(k => lowerPrompt.includes(k)) && hasExistingHtml;

      let systemInstruction = '';

      const filesContext = Object.keys(currentConfig?.files || {}).length > 0 
        ? Object.entries(currentConfig.files).map(([path, content]) => `<file path="${path}">\n${content}\n</file>`).join('\n')
        : `<file path="index.html">\n${existingHtml}\n</file>`;

      if (isContinuationMode && !isBotRequest) {
        systemInstruction = `You are a Senior Web UI/UX Engineer.
MODE: CONTINUATION (EXPANDING EXISTING SITE)
${historyContext}
${imageInstruction}

USER REQUEST: "${promptText}"

CRITICAL INSTRUCTIONS:
1. You MUST expand and continue building the site, adding new pages, sections, or logic requested.
2. The user has provided the existing codebase in <file> tags below.
3. You must output the ENTIRE updated files using <file path="...">...</file>.

CURRENT FILES TO MODIFY:
${filesContext}

STRICT OUTPUT RULES:
1. Return ONLY valid JSON for metadata WITHOUT markdown fences.
2. Then, AFTER the JSON, output the full updated files wrapped in <file path="...">...</file>.

JSON FORMAT:
{
  "type": "site",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "site_only",
  "title": "Expanded Site",
  "explanation": "${isUzbek ? "Sayt muvaffaqiyatli kengaytirildi va yangi sahifalar qo'shildi!" : isRussian ? "Сайт успешно дополнен и расширен новыми страницами!" : "Website expanded with new pages!"}"
}
<file path="index.html">
...
</file>
<file path="style.css">
...
</file>
`;

      } else if (isEditMode && isSiteRequest && !isBotRequest) {
        systemInstruction = `You are a Senior Web UI/UX Engineer.
MODE: EDIT EXISTING SITE
${historyContext}
${imageInstruction}

USER REQUEST: "${promptText}"

CRITICAL EDITING INSTRUCTIONS:
1. You MUST modify the code below according to the user request.
2. IF the user attached an image — match its design, colors, layout or style as closely as possible.
3. Keep all existing functionality — only change what was requested.
4. SPA NAVIGATION: NEVER use href="/" or href="page.html" in <a> tags! Use a JS function to hide/show sections.

CURRENT FILES TO MODIFY:
${filesContext}

STRICT OUTPUT RULES:
1. Return ONLY valid JSON for metadata WITHOUT markdown fences.
2. Then, AFTER the JSON, output all updated files wrapped in <file path="...">...</file> blocks!
3. Do NOT put the code inside the JSON object!

JSON FORMAT:
{
  "type": "site",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "site_only",
  "title": "Updated Site",
  "explanation": "Specific description of changes made..."
}
<file path="index.html">
...
</file>
`;

      } else if (isSiteRequest && !isBotRequest) {
        systemInstruction = `You are a Senior UI/UX Frontend Architect and Full-Stack Developer.
Generate a high-end FULLY RESPONSIVE multi-page SPA.
${historyContext}
${imageInstruction}

CRITICAL CREATION RULES:
1. MULTI-FILE ARCHITECTURE: You must split your code into multiple files (e.g. index.html, style.css, script.js).
2. Use the exact format:
<file path="index.html">
...html code here...
</file>
<file path="style.css">
...css code here...
</file>
<file path="script.js">
...js code here...
</file>

3. STRICT SPA NAVIGATION: Your script.js MUST include a router that hides all sections and shows only the active one (e.g. display:none for inactive). DO NOT just anchor-scroll down a long page.
4. PREMIUM DESIGN: Use Tailwind CSS + Glassmorphism (e.g., bg-white/10 backdrop-blur-xl border border-white/20) + smooth animations + gorgeous gradients + large spacing (p-12, gap-8). NEVER output plain/ugly layouts!
5. IMAGES: Real Unsplash high-res photos.

STRICT OUTPUT RULES:
1. Return ONLY valid JSON for metadata WITHOUT markdown fences.
2. Then, AFTER the JSON, output all the files wrapped in <file path="...">...</file> blocks.
3. Do NOT put the HTML/CSS inside the JSON object!

JSON OUTPUT:
{
  "type": "site",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "site_only",
  "title": "Site Title",
  "explanation": "${isUzbek ? "Premium ko'p faylli loyiha yaratildi!" : isRussian ? "Премиум проект с файловой системой успешно создан!" : "Premium multi-file project generated!"}"
}

<file path="index.html">
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body class="bg-gradient-to-br from-gray-900 to-black text-white">
...
<script src="script.js"></script>
</body>
</html>
</file>
<file path="style.css">
.glass { ... }
.page { display: none; }
.page.active { display: block; animation: fadeIn 0.5s; }
</file>
<file path="script.js">
function showPage(id) { ... }
</file>
`;

      } else {
        systemInstruction = `You are a Telegram Bot Architect.
${historyContext}
${imageInstruction}

If user attached an image of a bot flow/diagram — analyze it and create matching nodes.

CRITICAL FEATURE - LIMITLESS CREATION:
If the user asks for advanced features (databases, crypto, weather, payment processing, math, web requests), you MUST use a "custom_code" block. This block executes raw JS code on the backend!

STRICT RULE: Return ONLY a valid JSON object without markdown fences:
{
  "type": "bot_and_mini_app",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "bot_and_mini_app",
  "title": "Telegram Bot",
  "explanation": "${isUzbek ? 'Telegram bot va Mini App loyihangiz tayyorlandi!' : isRussian ? 'Логика Telegram-бота успешно создана!' : 'Telegram Bot workflow generated!'}",
  "project_data": {
    "appName": "Bot Name",
    "bot_blocks": [{"id":"node_start","type":"start","position":{"x":100,"y":150},"data":{"label":"Start","emoji":"▶","color":"#10d974","text":"Salom!"}}],
    "bot_edges": [{"id":"e1","source":"node_start","target":"node_2"}]
  }
}`;
      }

      const cfAccountId = (
        rawInput?.cfAccountId ||
        process.env.CLOUDFLARE_ACCOUNT_ID ||
        process.env.CF_ACCOUNT_ID ||
        ''
      ).trim();

      const cfApiToken = (
        rawInput?.cfApiToken ||
        process.env.CLOUDFLARE_API_TOKEN ||
        process.env.CF_API_TOKEN ||
        ''
      ).trim();

      const googleKey = (
        rawInput?.googleKey ||
        process.env.GOOGLE_AI_STUDIO_KEY ||
        process.env.GEMINI_API_KEY ||
        ''
      ).trim();

      const openrouterKey = (
        rawInput?.openrouterKey ||
        process.env.OPENROUTER_API_KEY ||
        ''
      ).trim();

      // 1. Try Cloudflare Workers AI if credentials exist
      if (cfAccountId && cfApiToken) {
        this.logger.log('⚡ Attempting Cloudflare Workers AI...');
        const cfResult = await this.callCloudflareAI(cfAccountId, cfApiToken, systemInstruction, promptText);
        if (cfResult) {
          this.logger.log(`✅ Cloudflare Workers AI success (Mode: ${isEditMode ? 'EDIT' : 'CREATE'} ${isSiteRequest ? 'SITE' : 'BOT'})`);
          return this.formatResponse(cfResult, isSiteRequest && !isBotRequest, isRussian, isUzbek, isEditMode, existingHtml, currentConfig);
        }
      }

      // 2. Try Google Gemini
      if (googleKey) {
        const result = await this.callGemini(googleKey, systemInstruction, promptText, imageBase64, imageMimeType, 0);
        if (result) {
          this.logger.log(`✅ Gemini success (Mode: ${isEditMode ? 'EDIT' : 'CREATE'} ${isSiteRequest ? 'SITE' : 'BOT'})`);
          return this.formatResponse(result, isSiteRequest && !isBotRequest, isRussian, isUzbek, isEditMode, existingHtml, currentConfig);
        }

        // 🔧 SELF-HEALING: retry with lower temperature if first attempt failed
        this.logger.warn('⚠️ First Gemini attempt failed — self-healing retry with temp=0.1');
        const retrySystemInstruction = isSiteRequest 
          ? systemInstruction + '\n\nCRITICAL: Ensure the JSON is perfectly valid, and the HTML is wrapped in ```html AFTER the JSON.'
          : systemInstruction + '\n\nCRITICAL: Return ONLY valid JSON. No markdown fences. No extra text.';
        const retryResult = await this.callGemini(googleKey, retrySystemInstruction, promptText, imageBase64, imageMimeType, 1);
        if (retryResult) {
          this.logger.log('✅ Self-healing retry succeeded!');
          return this.formatResponse(retryResult, isSiteRequest && !isBotRequest, isRussian, isUzbek, isEditMode, existingHtml, currentConfig);
        }
      }

      // 3. Try OpenRouter Fallback
      if (openrouterKey && openrouterKey.length > 10) {
        try {
          this.logger.log('🔄 Attempting OpenRouter fallback...');
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + openrouterKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'meta-llama/llama-3.3-70b-instruct:free',
              messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: promptText }
              ],
              max_tokens: 16384
            })
          });

          if (res.ok) {
            const data = await res.json();
            const text = data.choices?.[0]?.message?.content;
            if (text) {
              const parsed = this.extractJsonObject(text);
              if (parsed) {
                return this.formatResponse(parsed, isSiteRequest && !isBotRequest, isRussian, isUzbek, isEditMode, existingHtml, currentConfig);
              }
            }
          }
        } catch (err: any) {
          this.logger.error(`OpenRouter Error: ${err.message}`);
        }
      }

      // Last resort fallback if all AI models failed
      this.logger.error('❌ All Gemini and OpenRouter models failed to generate response');
      return {
        type: (isSiteRequest && !isBotRequest) ? 'site' : 'bot_and_mini_app',
        execution_mode: 'FULL_GENERATION',
        target_entity: (isSiteRequest && !isBotRequest) ? 'site_only' : 'bot_and_mini_app',
        title: 'Error',
        explanation: isRussian 
          ? '⚠️ Сервер ИИ временно перегружен или недоступен. Пожалуйста, повторите попытку через минуту.' 
          : isUzbek 
            ? '⚠️ AI serveri vaqtincha band. Iltimos, 1 daqiqadan so\'ng qayta urinib ko\'ring.' 
            : '⚠️ AI service unavailable. Please retry in a moment.',
        html: existingHtml || '',
        source_code: existingHtml || '',
        website_html: existingHtml || '',
        project_data: currentConfig || null
      };

    } catch (fatalError: any) {
      this.logger.error(`Fatal Service Error: ${fatalError.message}`);
      return {
        type: 'site',
        execution_mode: 'FULL_GENERATION',
        target_entity: 'site_only',
        title: 'Сайт',
        explanation: isRawRussian(rawInput) ? 'Произошла ошибка. Попробуйте ещё раз.' : 'Xatolik yuz berdi. Qayta urinib ko\'ring.',
        html: rawInput?.currentHtml || rawInput?.html || ''
      };
    }
  }

  /** Call Gemini API with optional Vision support */
  private async callGemini(
    apiKey: string,
    systemInstruction: string,
    userPrompt: string,
    imageBase64: string,
    imageMimeType: string,
    attempt: number
  ): Promise<any> {
    const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-pro'];
    const temperature = attempt === 0 ? 0.2 : 0.1;

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        // Build parts — add image if provided
        const parts: any[] = [{ text: `${systemInstruction}\n\nUser Input: ${userPrompt}` }];
        if (imageBase64 && imageBase64.length > 10) {
          parts.push({
            inline_data: {
              mime_type: imageMimeType || 'image/jpeg',
              data: imageBase64
            }
          });
          this.logger.log('🖼️ Vision mode: image attached to request');
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
          const errText = await res.text().catch(() => '');
          this.logger.warn(`Gemini Model ${model} HTTP ${res.status}: ${errText.substring(0, 200)}`);
          continue; // Try next model
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) continue;

        const parsed = this.extractJsonObject(text);
        if (parsed) {
          this.logger.log(`✅ Gemini model ${model} succeeded!`);
          return parsed;
        }
      } catch (e: any) {
        this.logger.warn(`Gemini model ${model} call error: ${e.message}`);
      }
    }
    return null;
  }

  async generatePatch(promptText: string, currentPageUrl?: string, selectedBlockId?: string | null, currentConfig?: any) {
    return this.generateFullProject(promptText, [], currentConfig, 'bot_and_mini_app');
  }

  private formatResponse(parsed: any, isSiteRequest: boolean, isRussian: boolean, isUzbek: boolean, isEditMode: boolean, fallbackHtml: string, currentConfig?: any) {
    let htmlCode =
      parsed.html ||
      parsed.source_code ||
      parsed.website_html ||
      parsed.site_code ||
      parsed.code ||
      parsed.project_data?.source_code ||
      parsed.project_data?.html ||
      parsed.project_data?.website_html ||
      fallbackHtml ||
      '';

    if (isSiteRequest && !htmlCode) {
      // Force the frontend's isValidHtml to fail and trigger self-healing
      htmlCode = '<!-- INVALID_HTML_FORCE_RETRY -->';
    }

    const targetEntity = (isSiteRequest || htmlCode && htmlCode !== '<!-- INVALID_HTML_FORCE_RETRY -->') ? 'site_only' : (parsed.target_entity || 'bot_and_mini_app');

    const defaultExpl = isEditMode
      ? (isRussian ? 'Сайт успешно обновлён! 🚀' : isUzbek ? 'Sayt muvaffaqiyatli yangilandi! 🚀' : 'Website updated!')
      : targetEntity === 'site_only'
        ? (isRussian ? 'Премиальный сайт успешно создан! 🚀' : isUzbek ? 'Premium veb-sayt yaratildi! 🚀' : 'Website generated!')
        : (isRussian ? 'Telegram-бот создан! 🤖' : isUzbek ? 'Telegram bot yaratildi! 🤖' : 'Bot workflow generated!');

    let expl = parsed.explanation;
    if (!expl || typeof expl !== 'string' || expl.includes('YOUR_EXPLANATION')) {
      expl = defaultExpl;
    }

    const title = parsed.title || parsed.project_data?.appName || (isEditMode ? 'Updated Site' : 'Premium Site');
    const projectData = parsed.project_data || {};

    if (htmlCode) {
      projectData.source_code = htmlCode;
      projectData.html = htmlCode;
      projectData.website_html = htmlCode;
    }

      let botBlocks = projectData.bot_blocks?.length ? projectData.bot_blocks : (currentConfig?.bot_blocks || []);
      let botEdges = projectData.bot_edges?.length ? projectData.bot_edges : (currentConfig?.bot_edges || []);

      // Graph Validation for Bots
      if (targetEntity === 'bot_and_mini_app' && Array.isArray(botBlocks)) {
        const validNodeIds = new Set(botBlocks.map((b: any) => b.id));
        if (Array.isArray(botEdges)) {
          // Remove edges pointing to non-existent nodes
          botEdges = botEdges.filter((e: any) => validNodeIds.has(e.source) && validNodeIds.has(e.target));
        }
      }

      return {
      type: targetEntity === 'site_only' ? 'site' : 'bot_and_mini_app',
      execution_mode: 'FULL_GENERATION',
      target_entity: targetEntity,
      title,
      explanation: expl,
      html: htmlCode,
      source_code: htmlCode,
      website_html: htmlCode,
      project_data: {
        target_entity: targetEntity,
        appName: title,
        theme: projectData.theme || 'glassmorphism',
        themeColor: projectData.themeColor || '#1e90ff',
        source_code: htmlCode,
        html: htmlCode,
        website_html: htmlCode,
        blocks: projectData.blocks?.length ? projectData.blocks : (currentConfig?.blocks || []),
        bot_blocks: botBlocks,
        bot_edges: botEdges,
        site_blocks: projectData.site_blocks?.length ? projectData.site_blocks : (currentConfig?.site_blocks || []),
        files: parsed.files || projectData.files || {}
      }
    };
  }

  /** Call Cloudflare Workers AI */
  private async callCloudflareAI(
    accountId: string,
    apiToken: string,
    systemInstruction: string,
    userPrompt: string
  ): Promise<any> {
    const models = [
      '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      '@cf/meta/llama-3.1-70b-instruct',
      '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
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
            const parsed = this.extractJsonObject(text);
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

  private extractJsonObject(text: string): any {
    if (!text) return null;

    let jsonPart = text;
    let htmlPart = '';

    // Find where HTML code block or tag starts
    const htmlStartMatch = text.match(/```html|<!DOCTYPE html>|<html/i);
    if (htmlStartMatch && htmlStartMatch.index !== undefined) {
      const idx = htmlStartMatch.index;
      jsonPart = text.substring(0, idx);
      htmlPart = text.substring(idx);
    }

    // Clean HTML part
    htmlPart = htmlPart
      .replace(/^```html\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    // Clean JSON part
    jsonPart = jsonPart.replace(/```json/gi, '').replace(/```/gi, '').trim();
    jsonPart = jsonPart.replace(/,\s*([\]}])/g, '$1');

    let parsedJson: any = null;
    const jsonMatch = jsonPart.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsedJson = JSON.parse(jsonMatch[0]);
      } catch (e) {}
    }

    if (!parsedJson) {
      parsedJson = {
        type: 'site',
        execution_mode: 'FULL_GENERATION',
        target_entity: 'site_only',
        explanation: 'Адаптированный сайт успешно создан!'
      };
    }

    // Truncation detection & Auto-Closer for safe rendering
    if (htmlPart && htmlPart.toLowerCase().includes('<html')) {
      const lowerHtml = htmlPart.toLowerCase();
      if (!lowerHtml.includes('</html>')) {
        parsedJson.has_more = true;
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
      parsedJson.html = htmlPart;
    }

    // Parse VFS files: <file path="name.ext">...</file>
    const files: Record<string, string> = {};
    const fileRegex = /<file\s+path=["']([^"']+)["']>([\s\S]*?)<\/file>/gi;
    let match;
    while ((match = fileRegex.exec(text)) !== null) {
      const path = match[1];
      const content = match[2].trim();
      files[path] = content;
    }

    if (Object.keys(files).length > 0) {
      parsedJson.files = files;
      
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
      }
    }

    return parsedJson;
  }
}

function isRawRussian(rawInput: any): boolean {
  const text = typeof rawInput === 'string' ? rawInput : (rawInput?.prompt || '');
  return /[а-яА-ЯёЁ]/.test(text);
}
