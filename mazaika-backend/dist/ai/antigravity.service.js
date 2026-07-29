"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AntigravityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntigravityService = void 0;
const common_1 = require("@nestjs/common");
const prompts_1 = require("./prompts");
const mazaika_db_service_1 = require("../cloud/mazaika-db.service");
let AntigravityService = AntigravityService_1 = class AntigravityService {
    mazaikaDb;
    logger = new common_1.Logger(AntigravityService_1.name);
    constructor(mazaikaDb) {
        this.mazaikaDb = mazaikaDb;
    }
    async generate(rawInput) {
        return this.generateFullProject(rawInput);
    }
    async generatePatch(promptText, currentPageUrl, selectedBlockId, currentConfig) {
        return this.generateFullProject(promptText, [], currentConfig, 'bot_and_mini_app');
    }
    async generateFullProject(rawInput, chatHistory = [], currentConfig, targetEntity) {
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
            const googleKey = (rawInput?.googleKey ||
                process.env.GOOGLE_AI_STUDIO_KEY ||
                process.env.GEMINI_API_KEY ||
                '').trim();
            let target = targetEntity;
            if (!target) {
                const routeRes = await this.callAI(prompts_1.ROUTING_AGENT_PROMPT, promptText, '', '', 0, true, googleKey);
                if (routeRes && routeRes.target) {
                    target = routeRes.target === 'bot_only' ? 'bot_and_mini_app' : routeRes.target;
                }
                else {
                    target = 'bot_and_mini_app';
                }
            }
            this.logger.log(`🚀 Routing determined target: ${target}`);
            const historyContext = chatHistory.length > 0
                ? `\n\nPrevious conversation:\n${chatHistory.slice(-5).map(m => `${m.role === 'user' ? 'User' : 'Antigravity'}: ${m.content}`).join('\n')}\n`
                : '';
            const isEditMode = existingHtml.trim().length > 50;
            let botData = null;
            let siteData = null;
            const userRequest = `USER REQUEST: "${promptText}"\n${historyContext}`;
            if (target === 'site_only') {
                siteData = await this.callAI(prompts_1.WEBAPP_AGENT_PROMPT, userRequest, imageBase64, imageMimeType, 0, false, googleKey);
            }
            else if (target === 'bot_and_mini_app') {
                const tasks = [
                    this.callAI(prompts_1.BOT_AGENT_PROMPT, userRequest, imageBase64, imageMimeType, 0, false, googleKey),
                    this.callAI(prompts_1.WEBAPP_AGENT_PROMPT, userRequest, imageBase64, imageMimeType, 0, false, googleKey)
                ];
                const [botRes, siteRes] = await Promise.all(tasks);
                botData = botRes;
                siteData = siteRes;
            }
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
            if (finalResult.html) {
                const slug = promptText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 20) || 'default-site';
                await this.mazaikaDb.save('global', `site_${slug}`, finalResult);
                finalResult.explanation += `\n\n🌐 Sening sayting Mazaika Cloud'da tayyor: /cloud/sites/${slug}`;
            }
            return finalResult;
        }
        catch (error) {
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
    async callAI(systemInstruction, userPrompt, imageBase64, imageMimeType, attempt, jsonMode, googleKey) {
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
    async callCloudflareAI(accountId, apiToken, systemInstruction, userPrompt) {
        const models = [
            'google/gemini-3.1-pro',
            'anthropic/claude-fable-5',
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
                        const parsed = this.extractJsonObjectWithSelfHeal(text);
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
    async callGemini(apiKey, systemInstruction, userPrompt, imageBase64, imageMimeType, attempt, jsonMode) {
        const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
        const temperature = attempt === 0 ? 0.7 : 0.3;
        for (const model of models) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
                const parts = [{ text: `${systemInstruction}\n\n${userPrompt}` }];
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
                if (!text)
                    continue;
                const parsed = this.extractJsonObjectWithSelfHeal(text);
                if (parsed)
                    return parsed;
            }
            catch (e) {
                this.logger.warn(`Gemini ${model} Error: ${e.message}`);
            }
        }
        if (attempt === 0) {
            this.logger.warn('Self-healing retry triggered');
            return this.callGemini(apiKey, systemInstruction, userPrompt, imageBase64, imageMimeType, 1, jsonMode);
        }
        return null;
    }
    extractJsonObjectWithSelfHeal(text) {
        if (!text)
            return null;
        let jsonText = text;
        let files = {};
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
        let parsedJson = null;
        const firstBrace = jsonText.indexOf('{');
        const lastBrace = jsonText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const jsonCandidate = jsonText.substring(firstBrace, lastBrace + 1);
            try {
                const cleaned = jsonCandidate.replace(/,\s*([\]}])/g, '$1');
                parsedJson = JSON.parse(cleaned);
            }
            catch (e) {
                this.logger.warn('JSON Parse failed on first attempt: ' + e);
            }
        }
        let htmlPart = '';
        if (!parsedJson) {
            parsedJson = {
                type: 'site',
                execution_mode: 'FULL_GENERATION',
                target_entity: 'site_only',
                explanation: 'Sayt muvaffaqiyatli yaratildi!'
            };
            if (!hasFiles) {
                let rawHtml = text.replace(/^```html\s*/i, '').replace(/```\s*$/i, '').trim();
                const fallbackMatch = rawHtml.match(/(?:<!DOCTYPE html>\s*)?<html[\s\S]*/i);
                if (fallbackMatch) {
                    htmlPart = fallbackMatch[0];
                    parsedJson.explanation = isRawRussian(text) ? rawHtml.replace(fallbackMatch[0], '').trim() || 'Код готов!' : rawHtml.replace(fallbackMatch[0], '').trim() || 'Kod tayyor!';
                }
                else {
                    htmlPart = rawHtml;
                }
                parsedJson.html = htmlPart;
                parsedJson.source_code = htmlPart;
            }
        }
        else {
            htmlPart = parsedJson.html || parsedJson.source_code || parsedJson.website_html || '';
            if (!htmlPart && typeof parsedJson.explanation === 'string' && parsedJson.explanation.includes('<html')) {
                const fallbackMatch = parsedJson.explanation.match(/(?:<!DOCTYPE html>\s*)?<html[\s\S]*/i);
                if (fallbackMatch) {
                    htmlPart = fallbackMatch[0];
                    parsedJson.source_code = htmlPart;
                    parsedJson.html = htmlPart;
                    parsedJson.explanation = parsedJson.explanation.replace(fallbackMatch[0], '').trim();
                    if (!parsedJson.explanation) {
                        parsedJson.explanation = isRawRussian(text) ? 'Готово! Код сгенерирован.' : 'Tayyor! Kod yaratildi.';
                    }
                }
            }
        }
        if (hasFiles) {
            parsedJson.files = files;
            if (files['index.html']) {
                parsedJson.html = files['index.html'];
                parsedJson.source_code = files['index.html'];
                htmlPart = files['index.html'];
            }
            if (parsedJson.ecosystem && Array.isArray(parsedJson.ecosystem.components)) {
                parsedJson.ecosystem.components.forEach((comp) => {
                    if (comp.source_file && files[comp.source_file]) {
                        comp.source_code = files[comp.source_file];
                    }
                });
            }
        }
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
        }
        else if (text) {
            const lowerText = text.toLowerCase();
            if (lowerText.includes('continue') || lowerText.includes('продолжить') || lowerText.includes('davom ettirish')) {
                hasMore = true;
            }
        }
        if (hasMore) {
            parsedJson.has_more = true;
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
                parsedJson.html = combinedHtml;
                parsedJson.source_code = combinedHtml;
            }
        }
        return parsedJson;
    }
};
exports.AntigravityService = AntigravityService;
exports.AntigravityService = AntigravityService = AntigravityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mazaika_db_service_1.MazaikaDbService])
], AntigravityService);
function isRawRussian(rawInput) {
    const text = typeof rawInput === 'string' ? rawInput : (rawInput?.prompt || '');
    return /[а-яА-ЯёЁ]/.test(text);
}
//# sourceMappingURL=antigravity.service.js.map