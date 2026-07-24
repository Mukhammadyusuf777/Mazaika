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
            if (typeof rawInput === 'string') {
                promptText = rawInput;
            }
            else if (typeof rawInput === 'object' && rawInput !== null) {
                promptText = rawInput.prompt || rawInput.message || rawInput.text || rawInput.promptText || '';
                existingHtml = rawInput.currentHtml || rawInput.html || rawInput.siteHtml || rawInput.currentConfig?.source_code || rawInput.currentConfig?.html || '';
            }
            if (!existingHtml && currentConfig) {
                existingHtml = currentConfig.source_code || currentConfig.html || '';
            }
            const isUzbek = /[ўғҳа-я]/i.test(promptText) && !/[ыэъ]/i.test(promptText);
            const isRussian = /[а-яА-ЯёЁ]/.test(promptText);
            const userLang = isUzbek ? 'UZBEK' : (isRussian ? 'RUSSIAN' : 'ENGLISH');
            const lowerPrompt = promptText.toLowerCase();
            const isSiteRequest = targetEntity === 'site_only' ||
                Boolean(existingHtml && existingHtml.length > 50) ||
                lowerPrompt.includes('сайт') ||
                lowerPrompt.includes('sayt') ||
                lowerPrompt.includes('магазин') ||
                lowerPrompt.includes('magazin') ||
                lowerPrompt.includes('landing') ||
                lowerPrompt.includes('лендинг') ||
                lowerPrompt.includes('shop') ||
                lowerPrompt.includes('store') ||
                lowerPrompt.includes('web') ||
                lowerPrompt.includes('веб') ||
                lowerPrompt.includes('измени') ||
                lowerPrompt.includes('поменяй') ||
                lowerPrompt.includes('добавь') ||
                lowerPrompt.includes('убери') ||
                lowerPrompt.includes('цвет') ||
                lowerPrompt.includes('фон') ||
                lowerPrompt.includes('текст');
            const googleKey = (process.env.GOOGLE_AI_STUDIO_KEY ||
                process.env.GEMINI_API_KEY ||
                '').trim();
            const historyContext = chatHistory.length > 0
                ? `\n\nPrevious conversation for context:\n${chatHistory.map(m => `${m.role === 'user' ? 'User' : 'Antigravity'}: ${m.content}`).join('\n')}\n`
                : '';
            const isEditMode = Boolean(existingHtml && existingHtml.trim().length > 50);
            let systemInstruction = '';
            if (isEditMode) {
                systemInstruction = `You are a Senior Web UI/UX Engineer.
MODE: EDIT EXISTING SITE
${historyContext}

USER REQUEST: "${promptText}"

CRITICAL EDITING INSTRUCTIONS:
1. You MUST modify the HTML code below according to the user request.
2. IF USER ASKS FOR "BLACK AND WHITE" (черно-белый): 
   - Replace ALL green, emerald, blue background and text classes (e.g., bg-emerald-500, text-emerald-400, bg-green-900) WITH black, white, and gray classes (e.g., bg-black, bg-white, text-zinc-900, bg-zinc-900, border-zinc-700).
3. IF USER ASKS FOR "IPHONE / GLASSMORPHISM" (стеклянный стиль):
   - Add 'backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl' to cards and containers.
4. IF USER ASKS FOR MOBILE ADAPTATION (адаптируй для телефона):
   - Make sure all containers use 'w-full px-4', grid uses 'grid-cols-1 md:grid-cols-2', text sizes use 'text-2xl md:text-5xl'.
   - Add a working responsive mobile navigation menu with JS toggle.

CURRENT HTML CODE TO MODIFY:
\`\`\`html
${existingHtml}
\`\`\`

STRICT OUTPUT RULES:
1. Return ONLY valid JSON with keys: "type", "execution_mode", "target_entity", "title", "explanation" and "html".
2. Do NOT send the exact same HTML back. You MUST change the code!
3. "explanation" MUST be a short sentence in ${userLang} describing EXACTLY what classes or colors were changed (e.g., "Дизайн переведен в черно-белую гамму: зелёные элементы заменены на тёмные и белые тона.").

JSON OUTPUT FORMAT without markdown fences:
{
  "type": "site",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "site_only",
  "title": "Updated Site",
  "explanation": "Конкретное описание изменений...",
  "html": "<!DOCTYPE html><html class='scroll-smooth'>...FULL UPDATED HTML CODE...</html>"
}`;
            }
            else {
                systemInstruction = isSiteRequest
                    ? `You are a Senior UI/UX Frontend Architect specializing in FULLY RESPONSIVE MOBILE-FIRST web design.
Generate a high-end multi-page SPA inside ONE standalone HTML file.
${historyContext}

CRITICAL CREATION RULES:
1. RESPONSIVE & MOBILE-FIRST: Include working Hamburger Menu for mobile (<button id="hamburger-btn" onclick="toggleMobileMenu()">).
2. MULTI-PAGE ROUTING: Include a working JS page switcher for tabs ("Home", "About", "Gallery", "Contact").
3. STYLING: Tailwind CSS + FontAwesome icons + Google Font Inter + Glassmorphism UI.
4. IMAGES: High-resolution real Unsplash images.
5. JSON OUTPUT ONLY without markdown fences:
{
  "type": "site",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "site_only",
  "title": "Site Title",
  "explanation": "${isUzbek ? "Mobil va PC uchun moslashuvchan premium sayt yaratildi!" : isRussian ? "Адаптированный для телефонов и ПК многостраничный сайт успешно создан!" : "Responsive multi-page website generated!"}",
  "html": "<!DOCTYPE html><html class='scroll-smooth'>...RESPONSIVE MULTI-PAGE HTML CODE WITH MOBILE HAMBURGER MENU JS...</html>"
}`
                    : `You are a Telegram Bot Architect. Return JSON matching bot structure.
${historyContext}
STRICT RULE: Return ONLY a valid JSON object without markdown fences:
{
  "type": "bot_and_mini_app",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "bot_and_mini_app",
  "title": "Telegram Bot",
  "explanation": "${isUzbek ? "Telegram bot va Mini App loyihangiz tayyorlandi!" : isRussian ? "Логика Telegram-бота и Mini App успешно создана!" : "Telegram Bot workflow generated successfully!"}",
  "project_data": {
    "appName": "Telegram Bot",
    "bot_blocks": [{ "id": "node_start", "type": "start", "position": {"x":100,"y":150}, "data": {"label":"Start","emoji":"▶","color":"#10d974","text":"Salom!"} }],
    "bot_edges": []
  }
}`;
            }
            if (googleKey) {
                try {
                    this.logger.log(`Generating via Gemini API (Mode: ${isEditMode ? 'EDIT' : 'CREATE'}) for: "${promptText.substring(0, 35)}..."`);
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleKey}`;
                    const res = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: `${systemInstruction}\n\nUser Input: ${promptText}` }] }],
                            generationConfig: {
                                responseMimeType: 'application/json',
                                temperature: isEditMode ? 0.3 : 0.4
                            },
                        }),
                    });
                    if (res.ok) {
                        const data = await res.json();
                        let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (text) {
                            const parsed = this.extractJsonObject(text);
                            if (parsed) {
                                this.logger.log('Successfully generated via Gemini!');
                                return this.formatResponse(parsed, isSiteRequest, isRussian, isUzbek, isEditMode, existingHtml);
                            }
                        }
                    }
                }
                catch (apiErr) {
                    this.logger.error(`Gemini API Error: ${apiErr.message}`);
                }
            }
            const openrouterKey = (process.env.OPENROUTER_API_KEY || '').trim();
            if (openrouterKey && openrouterKey.length > 10) {
                try {
                    this.logger.log('Attempting OpenRouter API generation...');
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
                            max_tokens: 8192
                        })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        let text = data.choices?.[0]?.message?.content;
                        if (text) {
                            const parsed = this.extractJsonObject(text);
                            if (parsed) {
                                this.logger.log('Successfully generated via OpenRouter!');
                                return this.formatResponse(parsed, isSiteRequest, isRussian, isUzbek, isEditMode, existingHtml);
                            }
                        }
                    }
                }
                catch (err) {
                    this.logger.error(`OpenRouter API Exception: ${err.message}`);
                }
            }
            return this.formatResponse({ html: existingHtml || null }, isSiteRequest, isRussian, isUzbek, isEditMode, existingHtml);
        }
        catch (fatalError) {
            this.logger.error(`Fatal Service Error: ${fatalError.message}`);
            return {
                type: "site",
                execution_mode: "FULL_GENERATION",
                target_entity: "site_only",
                title: "Сайт",
                explanation: "Изменения внесены!",
                html: rawInput?.currentHtml || rawInput?.html || ''
            };
        }
    }
    async generatePatch(promptText, currentPageUrl, selectedBlockId, currentConfig) {
        return this.generateFullProject(promptText, [], currentConfig, 'bot_and_mini_app');
    }
    formatResponse(parsed, isSiteRequest, isRussian, isUzbek, isEditMode, fallbackHtml) {
        const htmlCode = parsed.html || parsed.source_code || parsed.website_html || parsed.site_code || parsed.code || parsed.project_data?.source_code || fallbackHtml || '';
        const targetEntity = (isSiteRequest || htmlCode) ? 'site_only' : (parsed.target_entity || 'bot_and_mini_app');
        const defaultExpl = isEditMode
            ? (isRussian ? "Сайт успешно обновлен согласно вашим пожеланиям! 🚀" : isUzbek ? "Sayt muvaffaqiyatli tahrirlandi va yangilandi! 🚀" : "Website updated successfully based on your request!")
            : targetEntity === 'site_only'
                ? (isRussian ? "Премиальный многостраничный сайт успешно создан! Вы можете переключаться между страницами в меню шапки. 🚀" : isUzbek ? "Ko'p sahifali premium veb-sayt yaratildi! 🚀" : "High-end multi-page website generated with live SPA tab navigation!")
                : (isRussian ? "Логика Telegram-бота и Mini App успешно создана! 🤖" : isUzbek ? "Telegram bot va Mini App mantig'i muvaffaqiyatli yaratildi! 🤖" : "Telegram bot workflow generated successfully!");
        let expl = parsed.explanation;
        if (!expl || typeof expl !== 'string' || expl.includes('YOUR_EXPLANATION') || (targetEntity === 'site_only' && expl.toLowerCase().includes('bot'))) {
            expl = defaultExpl;
        }
        const title = parsed.title || parsed.project_data?.appName || (isEditMode ? 'Обновленный Сайт' : 'Премиум Сайт');
        const projectData = parsed.project_data || {};
        if (htmlCode) {
            projectData.source_code = htmlCode;
            projectData.html = htmlCode;
            projectData.website_html = htmlCode;
            projectData.site_code = htmlCode;
            projectData.code = htmlCode;
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
            site_code: htmlCode,
            code: htmlCode,
            project_data: {
                target_entity: targetEntity,
                appName: title,
                theme: projectData.theme || 'glassmorphism',
                themeColor: projectData.themeColor || '#1e90ff',
                source_code: htmlCode,
                html: htmlCode,
                website_html: htmlCode,
                site_code: htmlCode,
                code: htmlCode,
                blocks: projectData.blocks || [],
                bot_blocks: projectData.bot_blocks || [],
                site_blocks: projectData.site_blocks || []
            }
        };
    }
    extractJsonObject(text) {
        if (!text)
            return null;
        let cleanText = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
        try {
            return JSON.parse(cleanText);
        }
        catch (e) { }
        const startIdx = cleanText.indexOf('{');
        if (startIdx === -1)
            return null;
        let braceCount = 0;
        let inString = false;
        let isEscaped = false;
        for (let i = startIdx; i < cleanText.length; i++) {
            const char = cleanText[i];
            if (inString) {
                if (char === '\\' && !isEscaped) {
                    isEscaped = true;
                }
                else {
                    if (char === '"' && !isEscaped) {
                        inString = false;
                    }
                    isEscaped = false;
                }
            }
            else {
                if (char === '"') {
                    inString = true;
                }
                else if (char === '{') {
                    braceCount++;
                }
                else if (char === '}') {
                    braceCount--;
                    if (braceCount === 0) {
                        const candidate = cleanText.substring(startIdx, i + 1);
                        try {
                            return JSON.parse(candidate);
                        }
                        catch (e) { }
                    }
                }
            }
        }
        return null;
    }
};
exports.AntigravityService = AntigravityService;
exports.AntigravityService = AntigravityService = AntigravityService_1 = __decorate([
    (0, common_1.Injectable)()
], AntigravityService);
//# sourceMappingURL=antigravity.service.js.map