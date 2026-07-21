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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AntigravityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntigravityService = void 0;
const common_1 = require("@nestjs/common");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
let AntigravityService = AntigravityService_1 = class AntigravityService {
    logger = new common_1.Logger(AntigravityService_1.name);
    groq;
    constructor() {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            this.logger.warn("GROQ_API_KEY is missing! AI features will fail.");
        }
        this.groq = new groq_sdk_1.default({ apiKey: apiKey || 'dummy-key-to-avoid-crash' });
    }
    async generateFullProject(userPrompt, chatHistory = []) {
        this.logger.log(`Processing prompt: "${userPrompt}"`);
        const systemInstruction = `
You are "Mazaika AI", the elite core AI Copilot and Autonomous Architect for the "Mozaika Platform".
Mozaika is an advanced No-Code development system used to build high-performance Websites, Telegram Bots, and Telegram Mini Apps.

CRITICAL DIRECTIVE: CONVERSATION, CONTROL & GENERATION
You are a highly intelligent assistant that can answer general questions, control existing projects, and generate new ones.

1. DISCUSSION MODE
If the user is asking a general question, asking for advice, OR if they are proposing a new project but haven't given you the final green light to build it yet, you MUST return a discussion message.
{
  "execution_mode": "DISCUSSION",
  "explanation": "Your conversational response in Russian or Uzbek."
}
Example: "Я понял, вы хотите создать магазин автозапчастей. Я добавлю каталог, корзину и контакты. Начинаем?"

2. FULL GENERATION MODE
If the user explicitly agrees to build the project (e.g., "Yes, start", "go ahead", "create it"), classify the intent into "bot", "site", or "mini_app".
{
  "explanation": "Project successfully generated!",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "site",
  "project_data": {
    "appName": "Site Name",
    "theme": "glassmorphism",
    "themeColor": "#2563eb",
    "blocks": [
      { "id": "b1", "type": "hero", "title": "...", "subtitle": "...", "img": "url" }
    ]
  }
}
*Note for bots: Use node types: boshlash, xabar, matnli_savol, shart.*
*Note for sites: Use block types: hero, about, contacts.*
*Note for mini_apps: Use block types: hero, catalog, form, savat.*

3. PATCH (PROJECT CONTROL) MODE
If the user asks to modify an EXISTING project (e.g., "change the theme color to red", "add a new button", "translate to English"), you must issue a patch operation.
{
  "explanation": "Theme color updated to red.",
  "execution_mode": "PATCH",
  "patch_operations": [
    { "op": "replace", "path": "themeColor", "value": "#ef4444" }
  ]
}

OUTPUT FORMAT:
Generate ONLY raw valid JSON matching one of the three modes. DO NOT include markdown backticks like \`\`\`json.
`;
        try {
            const formattedHistory = chatHistory.map(msg => ({
                role: msg.role === 'agent' ? 'assistant' : 'user',
                content: msg.content
            }));
            const completion = await this.groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemInstruction },
                    ...formattedHistory,
                    { role: 'user', content: userPrompt }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.5,
            });
            const rawText = completion.choices[0]?.message?.content || '';
            const cleanedJson = this.cleanJsonResponse(rawText);
            return JSON.parse(cleanedJson);
        }
        catch (error) {
            this.logger.error(`AI Generation Failed: ${error.message}`);
            throw new common_1.InternalServerErrorException(`Не удалось сгенерировать ответ через ИИ. Ошибка от Groq: ${error.message}`);
        }
    }
    async generatePatch(userPrompt, currentPageUrl, selectedBlockId, currentConfig) {
        this.logger.log(`Generating contextual patch for blockId: ${selectedBlockId}, prompt: "${userPrompt}"`);
        const systemInstruction = `
You are "Mazaika AI", the contextual AI Copilot for Mozaika.
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
            const completion = await this.groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemInstruction },
                    { role: 'user', content: userPrompt }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.5,
            });
            const rawText = completion.choices[0]?.message?.content || '';
            const cleanedJson = this.cleanJsonResponse(rawText);
            return JSON.parse(cleanedJson);
        }
        catch (error) {
            this.logger.error(`AI Generation Failed: ${error.message}`);
            throw new common_1.InternalServerErrorException(`Не удалось обновить проект через ИИ. Ошибка от Groq: ${error.message}`);
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
};
exports.AntigravityService = AntigravityService;
exports.AntigravityService = AntigravityService = AntigravityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AntigravityService);
//# sourceMappingURL=antigravity.service.js.map