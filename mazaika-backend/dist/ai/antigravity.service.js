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
const prompts_1 = require("./prompts");
let AntigravityService = AntigravityService_1 = class AntigravityService {
    logger = new common_1.Logger(AntigravityService_1.name);
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
            if (!googleKey) {
                throw new Error('No API key provided.');
            }
            let target = targetEntity;
            if (!target) {
                const routeRes = await this.callGemini(googleKey, prompts_1.ROUTING_AGENT_PROMPT, promptText, '', '', 0, true);
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
                siteData = await this.callGemini(googleKey, prompts_1.WEBAPP_AGENT_PROMPT, userRequest, imageBase64, imageMimeType, 0, false);
            }
            else if (target === 'bot_and_mini_app') {
                const tasks = [
                    this.callGemini(googleKey, prompts_1.BOT_AGENT_PROMPT, userRequest, imageBase64, imageMimeType, 0, false),
                    this.callGemini(googleKey, prompts_1.WEBAPP_AGENT_PROMPT, userRequest, imageBase64, imageMimeType, 0, false)
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
                this.logger.warn('JSON Parse failed');
            }
        }
        if (!parsedJson)
            parsedJson = {};
        if (hasFiles) {
            parsedJson.files = files;
            if (files['index.html']) {
                parsedJson.html = files['index.html'];
            }
        }
        return parsedJson;
    }
};
exports.AntigravityService = AntigravityService;
exports.AntigravityService = AntigravityService = AntigravityService_1 = __decorate([
    (0, common_1.Injectable)()
], AntigravityService);
//# sourceMappingURL=antigravity.service.js.map