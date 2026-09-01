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
var GeminiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const common_1 = require("@nestjs/common");
const gemini_system_instruction_1 = require("./gemini-system-instruction");
const ai_security_1 = require("./ai-security");
let GeminiService = GeminiService_1 = class GeminiService {
    logger = new common_1.Logger(GeminiService_1.name);
    MAX_RETRIES = 3;
    MAX_HISTORY_LENGTH = 10;
    constructor() { }
    compactContext(history) {
        if (!history || history.length <= this.MAX_HISTORY_LENGTH) {
            return history || [];
        }
        this.logger.debug(`🗜 Compacting chat history from ${history.length} to ${this.MAX_HISTORY_LENGTH} messages.`);
        return history.slice(-this.MAX_HISTORY_LENGTH);
    }
    async generateResponse(userInput, chatHistory = []) {
        try {
            const sanitizedInput = ai_security_1.AiSecurityService.sanitizeUserInput(userInput);
            const compactedHistory = this.compactContext(chatHistory);
            return await this.callGeminiWithRetry(sanitizedInput, compactedHistory);
        }
        catch (error) {
            this.logger.error(`❌ Gemini Service Error: ${error.message}`);
            return this.executeFallbackStrategy(error);
        }
    }
    async callGeminiWithRetry(input, history, attempt = 1) {
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error('GEMINI_API_KEY is missing.');
            }
            const payload = {
                contents: [
                    { role: 'user', parts: [{ text: gemini_system_instruction_1.MAZAIKA_SYSTEM_PROMPT }] },
                    ...history.map(m => ({
                        role: m.role === 'user' ? 'user' : 'model',
                        parts: [{ text: m.content }]
                    })),
                    { role: 'user', parts: [{ text: input }] }
                ],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.2
                }
            };
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                if (response.status === 429 || response.status >= 500) {
                    throw new Error(`HTTP_${response.status}`);
                }
                throw new Error(`Gemini API Error: ${response.statusText}`);
            }
            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            return JSON.parse(textResponse);
        }
        catch (error) {
            if (attempt < this.MAX_RETRIES && (error.message.includes('HTTP_429') || error.message.includes('HTTP_5'))) {
                const delay = Math.pow(2, attempt) * 1000;
                this.logger.warn(`⚠️ Gemini API rate limited or internal error. Retrying in ${delay}ms (Attempt ${attempt + 1}/${this.MAX_RETRIES})...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.callGeminiWithRetry(input, history, attempt + 1);
            }
            throw error;
        }
    }
    executeFallbackStrategy(error) {
        this.logger.log('🛡 Executing Fallback Strategy...');
        let fallbackMessage = "Извините, в данный момент сервер перегружен. Пожалуйста, попробуйте позже.";
        let intent = "fallback_error";
        if (error.message.includes('SECURITY_VIOLATION')) {
            fallbackMessage = "Ваш запрос был заблокирован системой безопасности. Пожалуйста, задавайте вопросы только по теме бизнеса и платформы Mazaika.";
            intent = "malicious";
        }
        return {
            intent,
            reply_text: fallbackMessage,
            action_required: false,
            confidence_score: 1.0
        };
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = GeminiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map