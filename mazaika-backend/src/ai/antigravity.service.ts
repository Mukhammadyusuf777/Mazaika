import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface PatchOperation {
  op: 'replace' | 'add' | 'remove';
  path: string;
  value: any;
}

export interface FullGenerationResponse {
  explanation: string;
  appName: string;
  theme: string;
  themeColor: string;
  blocks: any[];
}

export interface PatchResponse {
  explanation: string;
  execution_mode: 'PATCH';
  patch_operations: PatchOperation[];
}

@Injectable()
export class AntigravityService {
  private readonly logger = new Logger(AntigravityService.name);
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GOOGLE_VERTEX_AI_KEY;
    if (!apiKey) {
      this.logger.warn("GOOGLE_VERTEX_AI_KEY is not set in environment variables. Gemini API calls will fail.");
    }
    // Note: We use the key from environment variables. DO NOT hardcode the key in source code.
    this.genAI = new GoogleGenerativeAI(apiKey || 'missing-key');
  }

  /**
   * Full Generation Hub: Creates full project JSON configuration via Gemini API
   */
  async generateFullProject(userPrompt: string): Promise<FullGenerationResponse> {
    this.logger.log(`Generating full project layout for prompt: "${userPrompt}"`);

    const systemInstruction = `
You are "Antigravity", the elite core AI Copilot and Autonomous Architect for the "Mozaika Platform".
Mozaika is an advanced No-Code development system used to build high-performance Websites, Telegram Bots, and Telegram Mini Apps.

CRITICAL DIRECTIVE: STRICT ENTITY SEPARATION & PROFESSIONAL QUALITY
You must classify the user's intent into exactly ONE of three target entities: "bot", "site", or "mini_app".
Depending on the entity, generate entirely different structural schemas. Write fully detailed, highly professional marketing and technical texts in perfect Russian or Uzbek (depending on the user's prompt). DO NOT generate lazy stubs like "Standart Xizmat". 

OUTPUT FORMAT:
Generate ONLY raw valid JSON. DO NOT include markdown backticks like \`\`\`json.

1. IF THE USER WANTS A "BOT" (Telegram Bot Flow):
{
  "explanation": "Professional summary of the bot workflow",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "bot",
  "project_data": {
    "appName": "Bot Name",
    "theme": "bot_flow",
    "blocks": [
      { "id": "node1", "type": "boshlash", "title": "Boshlash", "text": "Start node" },
      { "id": "node2", "type": "xabar", "title": "Xush kelibsiz", "text": "Assalomu alaykum! Xizmat turini tanlang:", "buttons": ["Katalog", "Aloqa", "Test ishlash"] },
      { "id": "node3", "type": "matnli_savol", "title": "Ism so'rash", "text": "Iltimos, ismingizni kiriting:", "variable": "user_name" },
      { "id": "node4", "type": "shart", "title": "Yosh tekshirish", "condition": "user_age >= 18", "true_node": "node5", "false_node": "node6" }
    ]
  }
}

2. IF THE USER WANTS A "SITE" (Landing Page):
{
  "explanation": "Professional summary of the landing page",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "site",
  "project_data": {
    "appName": "Site Name",
    "theme": "minimalist" | "glassmorphism",
    "themeColor": "#2563eb",
    "blocks": [
      { "id": "b1", "type": "hero", "title": "Engaging Headline", "subtitle": "High-quality marketing copy.", "ctaText": "Get Started", "img": "url" },
      { "id": "b2", "type": "about", "title": "Biz haqimizda", "text": "Detailed professional description of the company or service." },
      { "id": "b3", "type": "contacts", "title": "Aloqa", "phone": "+998 90 123 45 67", "telegram": "SupportBot" }
    ]
  }
}

3. IF THE USER WANTS A "MINI_APP" (Telegram Web App / Store):
{
  "explanation": "Professional summary of the mini app",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "mini_app",
  "project_data": {
    "appName": "App Name",
    "theme": "glassmorphism" | "neon",
    "themeColor": "#10b981",
    "blocks": [
      { "id": "m1", "type": "hero", "title": "Modern Interactive Header", "subtitle": "Description", "img": "url" },
      { "id": "m2", "type": "catalog", "title": "Mahsulotlar Katalogi", "items": [ { "id": "i1", "name": "Specific Product Name", "price": 450000, "desc": "Detailed features.", "img": "url" } ] },
      { "id": "m3", "type": "form", "title": "Buyurtma berish", "fields": [ { "name": "phone", "label": "Telefon raqam", "type": "tel", "required": true } ] },
      { "id": "m4", "type": "savat", "title": "Savat (Cart)", "payment_methods": ["Payme", "Click"] },
      { "id": "m5", "type": "loyalty", "title": "Cashback tizimi" },
      { "id": "m6", "type": "quiz", "title": "Interactive Quiz (if requested)", "questions": [ { "q": "Formula?", "options": ["A", "B"] } ] }
    ]
  }
}

Choose the correct entity schema based on the user's intent. Output ONLY the JSON object.
`;

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const promptText = `${systemInstruction}\n\nUser Prompt: ${userPrompt}`;

      const result = await model.generateContent(promptText);
      const rawText = result.response.text();
      const cleanedJson = this.cleanJsonResponse(rawText);

      return JSON.parse(cleanedJson) as FullGenerationResponse;
    } catch (error) {
      this.logger.error(`Gemini API Error in generateFullProject: ${error.message}`);
      throw new InternalServerErrorException('Не удалось сгенерировать проект через ИИ. Пожалуйста, проверьте настройки API.');
    }
  }

  /**
   * Contextual Updates: Returns JSON Patch operations for specific UI elements
   */
  async generatePatch(
    userPrompt: string,
    currentPageUrl?: string,
    selectedBlockId?: string | null,
    currentConfig?: any
  ): Promise<PatchResponse> {
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

      return JSON.parse(cleanedJson) as PatchResponse;
    } catch (error) {
      this.logger.error(`Gemini API Error in generatePatch: ${error.message}`);
      throw new InternalServerErrorException('Не удалось сгенерировать обновление через ИИ. Пожалуйста, проверьте настройки API.');
    }
  }

  /**
   * Clean JSON string by stripping markdown fences
   */
  private cleanJsonResponse(text: string): string {
    let clean = text.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json/, '').replace(/```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```/, '').replace(/```$/, '');
    }
    return clean.trim();
  }
}
