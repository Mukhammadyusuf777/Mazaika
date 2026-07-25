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
            const isBotRequest = BOT_KEYWORDS.some(k => lowerPrompt.includes(k)) && !isExplicitSite;
            const hasExistingHtml = Boolean(existingHtml && existingHtml.trim().length > 50);
            const isSiteRequest = targetEntity === 'site_only' ||
                hasImage ||
                isExplicitSite ||
                hasExistingHtml ||
                (isEditKeyword && hasExistingHtml);
            const googleKey = (process.env.GOOGLE_AI_STUDIO_KEY ||
                process.env.GEMINI_API_KEY ||
                '').trim();
            const historyContext = chatHistory.length > 0
                ? `\n\nPrevious conversation:\n${chatHistory.map(m => `${m.role === 'user' ? 'User' : 'Antigravity'}: ${m.content}`).join('\n')}\n`
                : '';
            const isEditMode = hasExistingHtml;
            const imageInstruction = hasImage
                ? `\n\nIMPORTANT: The user has attached an IMAGE. Analyze it carefully — it may be a design reference, screenshot, sketch, or diagram. Use it to understand what they want to create or replicate.`
                : '';
            let systemInstruction = '';
            if (isEditMode && isSiteRequest && !isBotRequest) {
                systemInstruction = `You are a Senior Web UI/UX Engineer.
MODE: EDIT EXISTING SITE
${historyContext}
${imageInstruction}

USER REQUEST: "${promptText}"

CRITICAL EDITING INSTRUCTIONS:
1. You MUST modify the HTML code below according to the user request.
2. IF the user attached an image — match its design, colors, layout or style as closely as possible.
3. Keep all existing functionality — only change what was requested.
4. NEVER truncate the HTML. You MUST output the entire document from <!DOCTYPE html> to </html>.

CURRENT HTML CODE TO MODIFY:
\`\`\`html
${existingHtml}
\`\`\`

STRICT OUTPUT RULES:
1. Return ONLY valid JSON for metadata WITHOUT markdown fences.
2. Then, AFTER the JSON, output the full updated HTML wrapped in a \`\`\`html code block!
3. Do NOT put the HTML inside the JSON object!

JSON FORMAT:
{
  "type": "site",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "site_only",
  "title": "Updated Site",
  "explanation": "Specific description of changes made..."
}
\`\`\`html
<!DOCTYPE html><html>...FULL UPDATED HTML...</html>
\`\`\`
`;
            }
            else if (isSiteRequest && !isBotRequest) {
                systemInstruction = `You are a Senior UI/UX Frontend Architect.
Generate a high-end FULLY RESPONSIVE multi-page SPA inside ONE standalone HTML file.
${historyContext}
${imageInstruction}

CRITICAL CREATION RULES:
1. MOBILE-FIRST: Include working Hamburger Menu for mobile.
2. MULTI-PAGE ROUTING: JS page switcher (Home, About, Gallery, Contact).
3. STYLING: Tailwind CSS CDN + Google Font Inter + Glassmorphism + smooth animations.
4. IMAGES: Real Unsplash high-res photos.
5. If user attached an image — match that design style, layout, and color palette.
6. HTML must be at least 200 lines, complete, with all CSS and JS inline.
7. NEVER truncate the HTML. You MUST output the entire document from <!DOCTYPE html> to </html>.

STRICT OUTPUT RULES:
1. Return ONLY valid JSON for metadata WITHOUT markdown fences.
2. Then, AFTER the JSON, output the full generated HTML wrapped in a \`\`\`html code block!
3. Do NOT put the HTML inside the JSON object!

JSON OUTPUT:
{
  "type": "site",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "site_only",
  "title": "Site Title",
  "explanation": "${isUzbek ? 'Mobil va PC uchun moslashuvchan premium sayt yaratildi!' : isRussian ? 'Адаптированный сайт успешно создан!' : 'Responsive website generated!'}"
}

\`\`\`html
<!DOCTYPE html><html>...COMPLETE HTML...</html>
\`\`\`
`;
            }
            else {
                systemInstruction = `You are a Telegram Bot Architect.
${historyContext}
${imageInstruction}

If user attached an image of a bot flow/diagram — analyze it and create matching nodes.

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
    "bot_edges": []
  }
}`;
            }
            if (googleKey) {
                const result = await this.callGemini(googleKey, systemInstruction, promptText, imageBase64, imageMimeType, 0);
                if (result) {
                    this.logger.log(`✅ Gemini success (Mode: ${isEditMode ? 'EDIT' : 'CREATE'} ${isSiteRequest ? 'SITE' : 'BOT'})`);
                    return this.formatResponse(result, isSiteRequest && !isBotRequest, isRussian, isUzbek, isEditMode, existingHtml, currentConfig);
                }
                this.logger.warn('⚠️ First Gemini attempt failed — self-healing retry with temp=0.1');
                const retryResult = await this.callGemini(googleKey, systemInstruction + '\n\nCRITICAL: Return ONLY valid JSON. No markdown fences. No extra text.', promptText, imageBase64, imageMimeType, 1);
                if (retryResult) {
                    this.logger.log('✅ Self-healing retry succeeded!');
                    return this.formatResponse(retryResult, isSiteRequest && !isBotRequest, isRussian, isUzbek, isEditMode, existingHtml, currentConfig);
                }
            }
            const openrouterKey = (process.env.OPENROUTER_API_KEY || '').trim();
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
            return this.formatResponse({ html: existingHtml || null }, isSiteRequest && !isBotRequest, isRussian, isUzbek, isEditMode, existingHtml, currentConfig);
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
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
            const temperature = attempt === 0 ? 0.2 : 0.1;
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
                        responseMimeType: 'application/json',
                        temperature,
                        maxOutputTokens: 16384
                    }
                })
            });
            if (!res.ok) {
                this.logger.error(`Gemini HTTP ${res.status}`);
                return null;
            }
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text)
                return null;
            const parsed = this.extractJsonObject(text);
            return parsed;
        }
        catch (e) {
            this.logger.error(`Gemini call error: ${e.message}`);
            return null;
        }
    }
    async generatePatch(promptText, currentPageUrl, selectedBlockId, currentConfig) {
        return this.generateFullProject(promptText, [], currentConfig, 'bot_and_mini_app');
    }
    formatResponse(parsed, isSiteRequest, isRussian, isUzbek, isEditMode, fallbackHtml, currentConfig) {
        const htmlCode = parsed.html ||
            parsed.source_code ||
            parsed.website_html ||
            parsed.site_code ||
            parsed.code ||
            parsed.project_data?.source_code ||
            fallbackHtml ||
            '';
        const targetEntity = (isSiteRequest || htmlCode) ? 'site_only' : (parsed.target_entity || 'bot_and_mini_app');
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
                bot_blocks: projectData.bot_blocks?.length ? projectData.bot_blocks : (currentConfig?.bot_blocks || []),
                bot_edges: projectData.bot_edges?.length ? projectData.bot_edges : (currentConfig?.bot_edges || []),
                site_blocks: projectData.site_blocks?.length ? projectData.site_blocks : (currentConfig?.site_blocks || [])
            }
        };
    }
    extractJsonObject(text) {
        if (!text)
            return null;
        const htmlMatch = text.match(/```html\s*([\s\S]*?)\s*```/i) || text.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
        let htmlContent = '';
        if (htmlMatch) {
            htmlContent = htmlMatch[1] || htmlMatch[0];
        }
        let cleanText = text.replace(/```json/gi, '').replace(/```html[\s\S]*?```/gi, '').replace(/```/gi, '').trim();
        try {
            const parsed = JSON.parse(cleanText);
            if (htmlContent && !parsed.html)
                parsed.html = htmlContent;
            return parsed;
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
                    if (char === '"' && !isEscaped)
                        inString = false;
                    isEscaped = false;
                }
            }
            else {
                if (char === '"')
                    inString = true;
                else if (char === '{')
                    braceCount++;
                else if (char === '}') {
                    braceCount--;
                    if (braceCount === 0) {
                        const candidate = cleanText.substring(startIdx, i + 1);
                        try {
                            const parsed = JSON.parse(candidate);
                            if (htmlContent && !parsed.html)
                                parsed.html = htmlContent;
                            return parsed;
                        }
                        catch (e) { }
                    }
                }
            }
        }
        if (htmlContent) {
            return { type: 'site', target_entity: 'site_only', html: htmlContent, explanation: 'Updated HTML' };
        }
        return null;
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