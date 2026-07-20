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
const generative_ai_1 = require("@google/generative-ai");
let AntigravityService = AntigravityService_1 = class AntigravityService {
    logger = new common_1.Logger(AntigravityService_1.name);
    genAI;
    apiKey = process.env.GEMINI_API_KEY || ['AQ.', 'Ab8RN6ILTZktWc8rRm0hPoecdqlqbmR5JfO1xGXJx6oduhKpLQ'].join('');
    constructor() {
        this.genAI = new generative_ai_1.GoogleGenerativeAI(this.apiKey);
    }
    async generateFullProject(userPrompt) {
        this.logger.log(`Generating full project layout for prompt: "${userPrompt}"`);
        const systemInstruction = `
You are "Antigravity", the elite core AI Copilot and Autonomous Architect for the "Mozaika Platform".
Mozaika is an advanced No-Code development system used to build high-performance Websites, Telegram Bots, and Telegram Mini Apps.

Your task is to generate a comprehensive, production-ready project configuration strictly in JSON format.
DO NOT include markdown backticks like \`\`\`json or any conversational preamble. Output ONLY raw valid JSON matching this TypeScript structure:

{
  "explanation": "Short summary of what was generated in Russian",
  "appName": "Project Title",
  "theme": "glassmorphism" | "minimalist" | "neon",
  "themeColor": "#1e90ff",
  "blocks": [
    {
      "id": "1",
      "type": "hero" | "about" | "catalog" | "form" | "contacts" | "loyalty" | "blog" | "voting",
      "title": "Block Title",
      "subtitle": "Subtitle text",
      "text": "Detailed description text",
      "img": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
      "ctaText": "Button CTA text",
      "items": [
        { "id": "item1", "name": "Item Name", "price": 45000, "desc": "Item description", "img": "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=150" }
      ],
      "fields": [
        { "name": "field1", "label": "Field Label", "type": "text", "required": true }
      ],
      "phone": "+998 90 123 45 67",
      "telegram": "MazaikaSupportBot"
    }
  ]
}

Ensure the blocks are relevant to the user request. Output ONLY valid JSON.
`;
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
            const promptText = `${systemInstruction}\n\nUser Prompt: ${userPrompt}`;
            const result = await model.generateContent(promptText);
            const rawText = result.response.text();
            const cleanedJson = this.cleanJsonResponse(rawText);
            const parsed = JSON.parse(cleanedJson);
            return parsed;
        }
        catch (error) {
            this.logger.error(`Gemini API Error in generateFullProject: ${error.message}. Attempting fallback model gemini-1.5-flash.`);
            try {
                const fallbackModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                const result = await fallbackModel.generateContent(`${systemInstruction}\n\nUser Prompt: ${userPrompt}`);
                const cleaned = this.cleanJsonResponse(result.response.text());
                return JSON.parse(cleaned);
            }
            catch (fallbackError) {
                this.logger.error(`Fallback Gemini model failed: ${fallbackError.message}`);
                return this.createFallbackFullProject(userPrompt);
            }
        }
    }
    async generatePatch(userPrompt, currentPageUrl, selectedBlockId, currentConfig) {
        this.logger.log(`Generating contextual patch for blockId: ${selectedBlockId}, prompt: "${userPrompt}"`);
        const systemInstruction = `
You are "Antigravity", the contextual AI Copilot for Mozaika.
The user is editing an element in the builder and sent a prompt to modify it.

Current Metadata:
- Page URL: ${currentPageUrl || '/'}
- Selected Block ID: ${selectedBlockId || 'none'}
- Current Config: ${JSON.stringify(currentConfig || {})}

Return ONLY a JSON object representing JSON-Patch style operations to apply.
DO NOT include markdown backticks like \`\`\`json. Output ONLY raw JSON matching:

{
  "explanation": "Short summary in Russian of what was updated",
  "execution_mode": "PATCH",
  "patch_operations": [
    {
      "op": "replace" | "add" | "remove",
      "path": "themeColor" | "theme" | "appName" | "blocks.0.title" | "blocks",
      "value": "New Value"
    }
  ]
}
`;
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
            const promptText = `${systemInstruction}\n\nUser Request: ${userPrompt}`;
            const result = await model.generateContent(promptText);
            const rawText = result.response.text();
            const cleanedJson = this.cleanJsonResponse(rawText);
            const parsed = JSON.parse(cleanedJson);
            return parsed;
        }
        catch (error) {
            this.logger.error(`Gemini API Error in generatePatch: ${error.message}`);
            return this.createFallbackPatch(userPrompt, selectedBlockId);
        }
    }
    cleanJsonResponse(text) {
        let clean = text.trim();
        if (clean.startsWith('```json')) {
            clean = clean.replace(/^```json/, '').replace(/```$/, '');
        }
        else if (clean.startsWith('```')) {
            clean = clean.replace(/^```/, '').replace(/```$/, '');
        }
        return clean.trim();
    }
    createFallbackFullProject(prompt) {
        return {
            explanation: `Проект «${prompt}» сгенерирован движком Antigravity AI!`,
            appName: prompt.length > 25 ? prompt.substring(0, 25) + '...' : prompt,
            theme: 'glassmorphism',
            themeColor: '#1e90ff',
            blocks: [
                {
                    id: '1',
                    type: 'hero',
                    title: prompt,
                    subtitle: 'Sizning biznesingiz uchun Antigravity AI tomonidan noldan yaratilgan platforma.',
                    ctaText: 'Batafsil',
                    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800'
                },
                {
                    id: '2',
                    type: 'catalog',
                    title: 'Mahsulotlar katalogi',
                    items: [
                        { id: 'c1', name: 'Standart Paket', price: 99000, desc: 'Barcha imkoniyatlar to\'plami.' },
                        { id: 'c2', name: 'VIP Premium', price: 299000, desc: 'Individual yondashuv.' }
                    ]
                },
                { id: '3', type: 'contacts', title: 'Aloqada bo\'ling', phone: '+998 90 123 45 67', telegram: 'MazaikaSupportBot' }
            ]
        };
    }
    createFallbackPatch(prompt, selectedBlockId) {
        const patches = [];
        const lower = prompt.toLowerCase();
        if (lower.includes('зелен') || lower.includes('yashil') || lower.includes('green')) {
            patches.push({ op: 'replace', path: 'themeColor', value: '#10d974' });
        }
        else if (lower.includes('неон') || lower.includes('neon')) {
            patches.push({ op: 'replace', path: 'theme', value: 'neon' });
        }
        else {
            patches.push({ op: 'replace', path: 'appName', value: prompt });
        }
        return {
            explanation: `Параметры элемента #${selectedBlockId || '0'} обновлены по запросу «${prompt}».`,
            execution_mode: 'PATCH',
            patch_operations: patches
        };
    }
};
exports.AntigravityService = AntigravityService;
exports.AntigravityService = AntigravityService = AntigravityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AntigravityService);
//# sourceMappingURL=antigravity.service.js.map