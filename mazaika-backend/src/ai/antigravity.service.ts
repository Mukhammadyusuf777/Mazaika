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
      "type": "hero" | "about" | "catalog" | "form" | "contacts" | "loyalty" | "blog" | "voting" | "quiz",
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
      "candidates": ["Option A", "Option B", "Option C"],
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
