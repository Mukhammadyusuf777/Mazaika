import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import Groq from 'groq-sdk';

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
  private groq: Groq;

  constructor() {
    // We use the Groq API key provided by the user via environment variables
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      this.logger.warn("GROQ_API_KEY is missing! AI features will fail.");
    }
    
    this.groq = new Groq({ apiKey: apiKey || 'dummy-key-to-avoid-crash' });
  }

  /**
   * Full Generation Hub: Creates full project JSON configuration via Groq API
   */
  async generateFullProject(userPrompt: string, chatHistory: { role: string; content: string }[] = []): Promise<any> {
    this.logger.log(`Processing prompt: "${userPrompt}"`);

    const systemInstruction = `
You are "Mazaika AI", an elite, highly intelligent AI Copilot and Autonomous Senior Architect for the "Mozaika Platform".
Mozaika is an advanced No-Code development system used to build high-performance Websites, Telegram Bots, and Telegram Mini Apps.

CRITICAL DIRECTIVE 1: ELITE PERSONA & STRICT JSON COMPLIANCE
You are not a simple bot. You are a highly intelligent, proactive, and analytical architect. 
In DISCUSSION MODE, provide deep, thoughtful analysis. Do not just say "I will do X. Start?". Instead, propose comprehensive architectures, ask insightful questions about edge cases, target audience, and business logic. Show the user that you understand their request on a profound level.
HOWEVER, no matter how conversational or smart you are, your ENTIRE response MUST be wrapped inside the valid JSON schema below. Put your conversational response ONLY inside the "explanation" string field. NEVER output plain text outside the JSON block.

CRITICAL DIRECTIVE 2: MASSIVE SCALE & PRODUCTION-READY GENERATION
When the user asks you to generate a project, DO NOT create small, lazy MVPs (e.g., just 3 blocks). You MUST generate a REAL, LARGE, fully complete, production-ready service.
- For Bots: Generate 8 to 15+ nodes covering deep logic trees, conditions, error handling, detailed menus, and rich text.
- For Sites/Mini Apps: Generate 8 to 15+ blocks covering hero, about, comprehensive catalogs, detailed forms, FAQs, contacts, footers, etc.

1. DISCUSSION MODE
If the user is asking a general question, asking for advice, OR proposing a new project but hasn't given the final green light to build it yet, you MUST return a discussion message.
{
  "execution_mode": "DISCUSSION",
  "explanation": "Your highly intelligent, analytical, and consultative response in Russian or Uzbek. Propose a massive, detailed architecture."
}

2. FULL GENERATION MODE
If the user explicitly agrees to build the project (e.g., "Yes, start", "go ahead", "create it", "давай", "yarat"), classify the intent into "bot", "site", or "mini_app". MANDATORY: Generate 8-15+ blocks!

IF THE USER WANTS A "BOT" (Telegram Bot Flow):
{
  "explanation": "Project successfully generated!",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "bot",
  "project_data": {
    "appName": "Bot Name",
    "theme": "bot_flow",
    "blocks": [
      { "id": "node1", "type": "boshlash", "title": "Boshlash", "text": "Start node" },
      { "id": "node2", "type": "xabar", "title": "Xush kelibsiz", "text": "Assalomu alaykum!", "buttons": ["Katalog", "Aloqa"] },
      { "id": "node3", "type": "matnli_savol", "title": "Ism so'rash", "text": "Ismingizni kiriting:", "variable": "user_name" },
      { "id": "node4", "type": "shart", "title": "Yosh tekshirish", "condition": "user_age >= 18", "true_node": "node5", "false_node": "node6" }
    ]
  }
}

IF THE USER WANTS A "SITE" (Landing Page):
{
  "explanation": "Project successfully generated!",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "site",
  "project_data": {
    "appName": "Site Name",
    "theme": "glassmorphism",
    "themeColor": "#2563eb",
    "blocks": [
      { "id": "b1", "type": "hero", "title": "Hero Title", "subtitle": "Subtitle.", "ctaText": "Get Started", "img": "url" },
      { "id": "b2", "type": "about", "title": "Biz haqimizda", "text": "About us text." },
      { "id": "b3", "type": "contacts", "title": "Aloqa", "phone": "+998 90 123 45 67", "telegram": "SupportBot" }
    ]
  }
}

IF THE USER WANTS A "MINI_APP" (Telegram Web App / Store):
{
  "explanation": "Project successfully generated!",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "mini_app",
  "project_data": {
    "appName": "App Name",
    "theme": "glassmorphism",
    "themeColor": "#10b981",
    "blocks": [
      { "id": "m1", "type": "hero", "title": "Interactive Header", "subtitle": "Description", "img": "url" },
      { "id": "m2", "type": "catalog", "title": "Mahsulotlar Katalogi", "items": [ { "id": "i1", "name": "Product Name", "price": 450000, "desc": "Features.", "img": "url" } ] },
      { "id": "m3", "type": "form", "title": "Buyurtma berish", "fields": [ { "name": "phone", "label": "Telefon raqam", "type": "tel", "required": true } ] },
      { "id": "m4", "type": "savat", "title": "Savat (Cart)", "payment_methods": ["Payme", "Click"] },
      { "id": "m5", "type": "loyalty", "title": "Cashback tizimi" },
      { "id": "m6", "type": "quiz", "title": "Interactive Quiz", "questions": [ { "q": "Formula?", "options": ["A", "B"] } ] }
    ]
  }
}

3. PATCH (PROJECT CONTROL) MODE
If the user asks to modify an EXISTING project (e.g., "change the theme color to red", "add a new button", "translate to English"), you must issue a patch operation.
{
  "explanation": "Theme color updated to red.",
  "execution_mode": "PATCH",
  "patch_operations": [
    { "op": "replace", "path": "themeColor", "value": "#ef4444" }
  ]
}

OUTPUT FORMAT (EXTREMELY STRICT):
You MUST output ONLY a single, raw, valid JSON object. 
DO NOT include any markdown formatting like \`\`\`json. 
DO NOT output any conversational text before or after the JSON. 
If you fail to return perfectly parsable JSON, the entire system will crash.
`;

    try {
      // Map frontend history to Groq history format
      const formattedHistory: any[] = chatHistory.map(msg => ({
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
        response_format: { type: 'json_object' },
      });

      const rawText = completion.choices[0]?.message?.content || '';
      const cleanedJson = this.cleanJsonResponse(rawText);

      return JSON.parse(cleanedJson);
    } catch (error: any) {
      this.logger.error(`AI Generation Failed: ${error.message}`);
      throw new InternalServerErrorException(`Не удалось сгенерировать ответ через ИИ. Ошибка от Groq: ${error.message}`);
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
        response_format: { type: 'json_object' },
      });

      const rawText = completion.choices[0]?.message?.content || '';
      const cleanedJson = this.cleanJsonResponse(rawText);

      return JSON.parse(cleanedJson) as PatchResponse;
    } catch (error: any) {
      this.logger.error(`AI Generation Failed: ${error.message}`);
      throw new InternalServerErrorException(`Не удалось обновить проект через ИИ. Ошибка от Groq: ${error.message}`);
    }
  }

  /**
   * Clean JSON string by extracting the first fully balanced JSON object.
   * This completely ignores any conversational text before or after the JSON.
   */
  private cleanJsonResponse(text: string): string {
    let clean = text.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const startIdx = clean.indexOf('{');
    if (startIdx === -1) return clean;

    let braceCount = 0;
    for (let i = startIdx; i < clean.length; i++) {
      if (clean[i] === '{') braceCount++;
      if (clean[i] === '}') braceCount--;
      if (braceCount === 0) {
        return clean.substring(startIdx, i + 1);
      }
    }
    return clean;
  }
}
