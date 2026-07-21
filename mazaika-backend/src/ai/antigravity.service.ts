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
