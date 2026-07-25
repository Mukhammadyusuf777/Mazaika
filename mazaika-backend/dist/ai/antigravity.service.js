"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AntigravityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntigravityService = void 0;
const common_1 = require("@nestjs/common");
let AntigravityService = AntigravityService_1 = class AntigravityService {
    logger = new common_1.Logger(AntigravityService_1.name);
    async generate(rawInput) {
        return this.generateFullProject(rawInput);
    }
    async generateFullProject(rawInput, chatHistory = [], currentConfig, targetEntity = 'bot_and_mini_app') {
        try {
            let promptText = '';
            let existingHtml = '';
            let imageBase64 = '';
            let imageMimeType = 'image/jpeg';
            if (typeof rawInput === 'string') {
                promptText = rawInput;
            }
            else if (typeof rawInput === 'object' && rawInput !== null) {
                promptText = rawInput.prompt || rawInput.message || rawInput.text || rawInput.promptText || '';
                existingHtml = rawInput.currentHtml || rawInput.html || rawInput.siteHtml || rawInput.currentConfig?.source_code || rawInput.currentConfig?.html || '';
                imageBase64 = rawInput.imageBase64 || '';
                imageMimeType = rawInput.imageMimeType || 'image/jpeg';
                if (rawInput.chatHistory?.length > 0)
                    chatHistory = rawInput.chatHistory;
                if (rawInput.targetEntity)
                    targetEntity = rawInput.targetEntity;
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
3. MULTI-FILE ARCHITECTURE (OPTIONAL BUT ENCOURAGED): You have the freedom to split your code into separate files like style.css and script.js if the project is complex. If it's simple, you can keep it in index.html.
4. Output the ENTIRE updated files using <file path="...">...</file>.

CURRENT FILES TO MODIFY:
${filesContext}

STRICT OUTPUT RULES:
1. Return ONLY valid JSON for metadata WITHOUT markdown fences.
2. Then, AFTER the JSON, output the full updated files wrapped in <file path="...">...</file>.
3. If you do not use <file path="...">...</file> tags, the system will crash!

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
            }
            else if (isEditMode && isSiteRequest && !isBotRequest) {
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
5. MULTI-FILE ARCHITECTURE (OPTIONAL BUT ENCOURAGED): You have the freedom to split HTML, CSS, and JS using <file path="...">...</file> blocks if it simplifies the project.

CURRENT FILES TO MODIFY:
${filesContext}

STRICT OUTPUT RULES:
1. Return ONLY valid JSON for metadata WITHOUT markdown fences.
2. Then, AFTER the JSON, output all updated files wrapped in <file path="...">...</file> blocks!
3. Do NOT put the code inside the JSON object!
4. If you do not use <file path="...">...</file> tags, the system will crash!

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
            }
            else if (isSiteRequest && !isBotRequest) {
                systemInstruction = `You are a Senior UI/UX Frontend Architect and Full-Stack Developer.
Generate a high-end FULLY RESPONSIVE multi-page SPA.
${historyContext}
${imageInstruction}

CRITICAL CREATION RULES:
1. MULTI-FILE ARCHITECTURE: If the project is simple (landing page, portfolio), keep it in one index.html. If complex (dashboard, shop, multi-page app), split into files (e.g., index.html, style.css, script.js).
2. If you use separate files, use the exact XML-like format to demarcate files:
<file path="index.html">
...html code here...
</file>
<file path="style.css">
...css code here...
</file>
<file path="script.js">
...js code here...
</file>

3. STRICT SPA NAVIGATION: Use a JS function like showPage(pageId) that hides all sections and shows only the active one (e.g., display:none for inactive). NEVER use href="page.html".
4. PREMIUM DESIGN (STUNNING): Use dark theme by default, glassmorphism cards (bg-white/10 backdrop-blur-xl), gorgeous gradient hero sections, and real Unsplash images. Create STUNNING, PREMIUM websites. DO NOT output plain or basic layouts!
5. REAL DATA: Use real content (names, descriptions, prices). NEVER use Lorem Ipsum.

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
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="style.css">
</head>
<body class="bg-gray-900 text-white min-h-screen">
...
<script src="script.js"></script>
</body>
</html>
</file>
<file path="style.css">
.glass { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
.page { display: none; }
.page.active { display: block; animation: fadeIn 0.5s; }
</file>
<file path="script.js">
function showPage(id) { 
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
</file>
`;
            }
            else {
                systemInstruction = `You are a Telegram Bot Architect.
${historyContext}
${imageInstruction}

If user attached an image of a bot flow/diagram — analyze it and create matching nodes.

CRITICAL CREATION RULES:
1. If the user writes in Russian or Uzbek, you MUST use Russian or Uzbek text respectively in bot messages.
2. ALWAYS lay out nodes with proper x/y coordinates. Place nodes in a grid/branching layout, NOT a single vertical column. Use x values: 100, 400, 700, 1000 for different branches. Use y values that increase by 200 per row. For buttons creating branches, place child nodes with different x positions.
3. Include 5-10 meaningful nodes for ANY bot request. Build a complete flow.

NODE TYPES (ONLY use these exact type strings):
- start: {"id":"node_1", "type":"start", "position":{"x":100,"y":150}, "data":{"label":"Boshlash", "emoji":"▶", "color":"#10d974", "text":"Assalomu alaykum! Botga xush kelibsiz."}}
- message: {"id":"node_2", "type":"message", "position":{"x":400,"y":150}, "data":{"label":"Xabar", "emoji":"💬", "color":"#1e90ff", "text":"Sizga qanday yordam bera olaman?", "buttons":["Mahsulotlar", "Aloqa", "Haqida"]}}
- question: {"id":"node_3", "type":"question", "position":{"x":100,"y":350}, "data":{"label":"Savol", "emoji":"❓", "color":"#ffb830", "text":"Ismingizni kiriting:", "variable":"user_name"}}
- condition: {"id":"node_4", "type":"condition", "position":{"x":400,"y":550}, "data":{"label":"Tekshiruv", "emoji":"🔀", "color":"#ff6b6b", "variable":"user_name", "operator":"!=", "value":""}}
- http: {"id":"node_5", "type":"http", "position":{"x":100,"y":750}, "data":{"label":"API So'rov", "emoji":"🌐", "color":"#00f5c4", "url":"https://api.example.com/data", "method":"GET", "resultVariable":"api_result"}}
- javascript: {"id":"node_6", "type":"javascript", "position":{"x":400,"y":750}, "data":{"label":"Kod", "emoji":"⚡", "color":"#ff9f43", "code":"return { message: 'Hello ' + variables.user_name };"}}
- timer: {"id":"node_7", "type":"timer", "position":{"x":100,"y":950}, "data":{"label":"Kechiktirish", "emoji":"⏱", "color":"#6366f1", "delayAmount":3, "delayUnit":"seconds"}}
- payme: {"id":"node_8", "type":"payme", "position":{"x":400,"y":950}, "data":{"label":"To'lov (Payme)", "emoji":"💳", "color":"#10d974", "price":99000, "description":"Tovar uchun to'lov"}}
- variable: {"id":"node_9", "type":"variable", "position":{"x":100,"y":1150}, "data":{"label":"O'zgaruvchi", "emoji":"📝", "color":"#a855f7", "variableName":"order_id", "variableValue":"{{timestamp}}"}}
- photo: {"id":"node_10", "type":"photo", "position":{"x":400,"y":1150}, "data":{"label":"Rasm", "emoji":"📷", "color":"#0ea5e9", "fileId":"", "caption":"Mahsulot rasmi"}}
- aiReply: {"id":"node_11", "type":"aiReply", "position":{"x":100,"y":1350}, "data":{"label":"AI Javob", "emoji":"🧠", "color":"#a855f7", "model":"gemini-flash", "prompt":"Foydalanuvchining savoliga professional javob bering"}}

IMPORTANT rules for the message node:
- To add buttons to a message, put them in the buttons array of the MESSAGE node (NOT a separate button_group node)
- Buttons can be simple strings: {"buttons": ["Mahsulotlar", "Biz haqimizda", "Aloqa"]}
- Or objects: {"buttons": [{"text": "Buyurtma", "nextNodeId": "node_3"}]}

STRICT RULE: Return ONLY a valid JSON object without markdown fences, and then optionally output files:
{
  "type": "bot_and_mini_app",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "bot_and_mini_app",
  "title": "Telegram Bot",
  "explanation": "Telegram botingiz yaratildi! Bot ushbu imkoniyatlarga ega: xabarlar, savollar, shartli mantiq, HTTP API so'rovlar, to'lov tizimlari (Payme, Click), rasmlar va AI javoblar.",
  "project_data": {
    "appName": "Bot Name",
    "bot_blocks": [{"id":"node_1","type":"start","position":{"x":100,"y":150},"data":{"label":"Boshlash","emoji":"▶","color":"#10d974","text":"Salom!"}}],
    "bot_edges": [{"id":"e1","source":"node_1","target":"node_2"}]
  }
}`;
            }
            const cfAccountId = (rawInput?.cfAccountId ||
                process.env.CLOUDFLARE_ACCOUNT_ID ||
                process.env.CF_ACCOUNT_ID ||
                '').trim();
            const cfApiToken = (rawInput?.cfApiToken ||
                process.env.CLOUDFLARE_API_TOKEN ||
                process.env.CF_API_TOKEN ||
                '').trim();
            const googleKey = (rawInput?.googleKey ||
                process.env.GOOGLE_AI_STUDIO_KEY ||
                process.env.GEMINI_API_KEY ||
                '').trim();
            const openrouterKey = (rawInput?.openrouterKey ||
                process.env.OPENROUTER_API_KEY ||
                '').trim();
            if (cfAccountId && cfApiToken) {
                this.logger.log('⚡ Attempting Cloudflare Workers AI...');
                const cfResult = await this.callCloudflareAI(cfAccountId, cfApiToken, systemInstruction, promptText);
                if (cfResult) {
                    this.logger.log(`✅ Cloudflare Workers AI success (Mode: ${isEditMode ? 'EDIT' : 'CREATE'} ${isSiteRequest ? 'SITE' : 'BOT'})`);
                    return this.formatResponse(cfResult, isSiteRequest && !isBotRequest, isRussian, isUzbek, isEditMode, existingHtml, currentConfig);
                }
            }
            if (googleKey) {
                let result = await this.callGemini(googleKey, systemInstruction, promptText, imageBase64, imageMimeType, 0);
                const isInvalid = !result || (!result.html && !result.files && !(result.project_data?.bot_blocks?.length > 0));
                if (result && !isInvalid) {
                    this.logger.log(`✅ Gemini success (Mode: ${isEditMode ? 'EDIT' : 'CREATE'} ${isSiteRequest ? 'SITE' : 'BOT'})`);
                    return this.formatResponse(result, isSiteRequest && !isBotRequest, isRussian, isUzbek, isEditMode, existingHtml, currentConfig);
                }
                this.logger.warn('⚠️ First Gemini attempt returned empty or invalid result — self-healing retry with temp=0.3');
                const retrySystemInstruction = isSiteRequest
                    ? systemInstruction + '\n\nCRITICAL: Ensure the JSON is perfectly valid, and the HTML is wrapped in <file path="..."> AFTER the JSON.'
                    : systemInstruction + '\n\nCRITICAL: Return ONLY valid JSON. No markdown fences. No extra text.';
                const retryResult = await this.callGemini(googleKey, retrySystemInstruction, promptText, imageBase64, imageMimeType, 1);
                if (retryResult) {
                    this.logger.log('✅ Self-healing retry succeeded!');
                    return this.formatResponse(retryResult, isSiteRequest && !isBotRequest, isRussian, isUzbek, isEditMode, existingHtml, currentConfig);
                }
            }
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
                }
                catch (err) {
                    this.logger.error(`OpenRouter Error: ${err.message}`);
                }
            }
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
        }
        catch (fatalError) {
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
    async callGemini(apiKey, systemInstruction, userPrompt, imageBase64, imageMimeType, attempt) {
        const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-pro'];
        const temperature = attempt === 0 ? 0.7 : 0.3;
        for (const model of models) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
                const parts = [{ text: `${systemInstruction}\n\nUser Input: ${userPrompt}` }];
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
                    continue;
                }
                const data = await res.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text)
                    continue;
                const parsed = this.extractJsonObject(text);
                if (parsed) {
                    this.logger.log(`✅ Gemini model ${model} succeeded!`);
                    return parsed;
                }
            }
            catch (e) {
                this.logger.warn(`Gemini model ${model} call error: ${e.message}`);
            }
        }
        return null;
    }
    async generatePatch(promptText, currentPageUrl, selectedBlockId, currentConfig) {
        return this.generateFullProject(promptText, [], currentConfig, 'bot_and_mini_app');
    }
    formatResponse(parsed, isSiteRequest, isRussian, isUzbek, isEditMode, fallbackHtml, currentConfig) {
        let htmlCode = parsed.html ||
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
        if (targetEntity === 'bot_and_mini_app' && Array.isArray(botBlocks)) {
            const validNodeIds = new Set(botBlocks.map((b) => b.id));
            if (Array.isArray(botEdges)) {
                botEdges = botEdges.filter((e) => validNodeIds.has(e.source) && validNodeIds.has(e.target));
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
    async callCloudflareAI(accountId, apiToken, systemInstruction, userPrompt) {
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
                }
                else {
                    const errText = await res.text().catch(() => '');
                    this.logger.warn(`Cloudflare AI ${model} HTTP ${res.status}: ${errText.substring(0, 150)}`);
                }
            }
            catch (e) {
                this.logger.warn(`Cloudflare AI ${model} error: ${e.message}`);
            }
        }
        return null;
    }
    extractJsonObject(text) {
        if (!text)
            return null;
        let jsonPart = text;
        let htmlPart = '';
        const htmlStartMatch = text.match(/```html|<!DOCTYPE html>|<html/i);
        if (htmlStartMatch && htmlStartMatch.index !== undefined) {
            const idx = htmlStartMatch.index;
            jsonPart = text.substring(0, idx);
            htmlPart = text.substring(idx);
        }
        htmlPart = htmlPart
            .replace(/^```html\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim();
        jsonPart = jsonPart.replace(/```json/gi, '').replace(/```/gi, '').trim();
        jsonPart = jsonPart.replace(/,\s*([\]}])/g, '$1');
        let parsedJson = null;
        const jsonMatch = jsonPart.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                parsedJson = JSON.parse(jsonMatch[0]);
            }
            catch (e) { }
        }
        if (!parsedJson) {
            parsedJson = {
                type: 'site',
                execution_mode: 'FULL_GENERATION',
                target_entity: 'site_only',
                explanation: 'Адаптированный сайт успешно создан!'
            };
        }
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
        const files = {};
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
                parsedJson.html = combinedHtml;
            }
        }
        return parsedJson;
    }
};
exports.AntigravityService = AntigravityService;
exports.AntigravityService = AntigravityService = AntigravityService_1 = __decorate([
    (0, common_1.Injectable)()
], AntigravityService);
function isRawRussian(rawInput) {
    const text = typeof rawInput === 'string' ? rawInput : (rawInput?.prompt || '');
    return /[а-яА-ЯёЁ]/.test(text);
}
//# sourceMappingURL=antigravity.service.js.map