import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import Groq from 'groq-sdk';
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
  private groq: Groq;
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    
    if (geminiKey) {
      this.genAI = new GoogleGenerativeAI(geminiKey);
      this.logger.log("Initialized Gemini AI (No TPM Limits!)");
    } else if (groqKey) {
      this.groq = new Groq({ apiKey: groqKey });
      this.logger.log("Initialized Groq AI (Warning: strict TPM limits)");
    } else {
      this.logger.warn("No API Keys found! AI features will fail.");
      this.groq = new Groq({ apiKey: 'dummy-key-to-avoid-crash' });
    }
  }

  /**
   * Helper to aggressively minify the config to avoid Groq TPM limits
   */
  private minifyConfig(config: any): any {
    if (!config) return config;
    const minified = JSON.parse(JSON.stringify(config)); // deep clone
    
    // Whitelist of properties the AI actually needs to understand the architecture and connections
    const keepProps = ['id', 'type', 'title', 'buttons', 'next_node', 'true_node', 'false_node', 'variable', 'condition', 'text', 'target_node', 'op', 'path', 'value'];

    const pruneProps = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      Object.keys(obj).forEach(key => {
        if (!keepProps.includes(key) && isNaN(Number(key))) {
          delete obj[key];
        } else {
          if (typeof obj[key] === 'string' && obj[key].length > 40) {
            // Keep only first 40 chars of long strings to save tokens
            obj[key] = obj[key].substring(0, 40) + '...';
          }
          if (typeof obj[key] === 'object') {
            pruneProps(obj[key]);
          }
        }
      });
    };

    if (minified.bot_blocks) pruneProps(minified.bot_blocks);
    if (minified.site_blocks) pruneProps(minified.site_blocks);
    if (minified.blocks) pruneProps(minified.blocks);
    
    // Remove empty arrays to save tokens
    if (Array.isArray(minified.blocks) && minified.blocks.length === 0) delete minified.blocks;
    if (Array.isArray(minified.site_blocks) && minified.site_blocks.length === 0) delete minified.site_blocks;
    if (Array.isArray(minified.bot_blocks) && minified.bot_blocks.length === 0) delete minified.bot_blocks;
    
    return minified;
  }

  /**
   * Full Generation Hub: Creates full project JSON configuration via Groq API
   */
  async generateFullProject(userPrompt: string, chatHistory: { role: string; content: string }[] = [], currentConfig?: any): Promise<any> {
    this.logger.log(`Processing prompt: "${userPrompt}"`);
    
    const minifiedConfig = this.minifyConfig(currentConfig);

    const systemInstruction = `
You are "Mazaika AI", an elite, highly intelligent AI Copilot and Autonomous Senior Architect for the "Mozaika Platform".
Mozaika is an advanced No-Code development system used to build high-performance Websites, Telegram Bots, and Telegram Mini Apps.

${minifiedConfig ? `CRITICAL CONTEXT - EXISTING PROJECT STATE:
The user has already generated a project. You are modifying or extending it. 
CURRENT CONFIGURATION (MINIFIED TO SAVE TOKENS):
${JSON.stringify(minifiedConfig)}

CRITICAL RULE FOR EXISTING PROJECTS: 
Because you are modifying an EXISTING project, you are STRICTLY FORBIDDEN from using FULL_GENERATION mode. 
You MUST use PATCH mode. If you need to add 20 blocks, output 20 'add' operations. 
The configuration above has been truncated (strings ending in '...') to save tokens. By using PATCH, you avoid destroying the original data.` : ''}

CRITICAL DIRECTIVE 1: ELITE PERSONA & STRICT JSON COMPLIANCE
You are not a simple bot. You are a highly intelligent, proactive, and analytical architect. 
In DISCUSSION MODE, provide deep, thoughtful analysis. Do not just say "I will do X. Start?". Instead, propose comprehensive architectures, ask insightful questions about edge cases, target audience, and business logic. Show the user that you understand their request on a profound level.
HOWEVER, no matter how conversational or smart you are, your ENTIRE response MUST be wrapped inside the valid JSON schema below. Put your conversational response ONLY inside the "explanation" string field. NEVER output plain text outside the JSON block.

CRITICAL DIRECTIVE 2: MASSIVE SCALE & NO LAZINESS
When the user asks you to generate a NEW project from scratch, you MUST generate a REAL, LARGE, fully complete, production-ready service in FULL_GENERATION mode.
YOU ARE STRICTLY REQUIRED TO GENERATE 20 TO 30+ BLOCKS/NODES. NO EXCUSES. DO NOT output just 1 or 2 blocks. If you output a tiny project, you will be penalized.
- For Bots: Generate 20-30+ nodes covering logic trees, menus, sub-menus, cart logic, registration, etc.
- For Sites/Mini Apps: Generate 20-30+ blocks covering hero, about, detailed catalogs, multiple forms, FAQs, etc.

1. DISCUSSION MODE
If the user is asking a general question, asking for advice, OR proposing a new project but gives very few details (e.g., "make me a shop"), you MUST return a discussion message and ask clarifying questions first (target audience, style, specific features). DO NOT guess or generate blindly if requirements are vague.
Also use this mode if the user hasn't given the final green light to build it yet.
{
  "execution_mode": "DISCUSSION",
  "explanation": "Your highly intelligent, analytical, and consultative response in Russian or Uzbek. Propose a massive, detailed architecture."
}

2. FULL GENERATION MODE (ONLY FOR BRAND NEW PROJECTS)
If the user explicitly agrees to build a NEW project and provides enough details, classify the intent into "bot", "site", "mini_app", or "bot_and_mini_app". MANDATORY: Generate 20-30+ blocks!

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
      { "id": "node2", "type": "xabar", "title": "Xush kelibsiz", "text": "Assalomu alaykum!", "buttons": [{"text": "Katalog", "target_node": "node3"}, {"text": "Aloqa", "target_node": "node4"}] },
      { "id": "node3", "type": "matnli_savol", "title": "Ism so'rash", "text": "Ismingizni kiriting:", "variable": "user_name", "next_node": "node4" },
      { "id": "node4", "type": "shart", "title": "Yosh tekshirish", "condition": "user_age >= 18", "true_node": "node5", "false_node": "node6" },
      "... YOU MUST ADD AT LEAST 15-20 MORE NODES HERE (catalog, cart, checkout, faq, etc) ...",
      "CRITICAL: ALL buttons in bot blocks MUST be objects containing 'text' and 'target_node' (the ID of the block it leads to) to ensure proper branching!"
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
      { "id": "b3", "type": "contacts", "title": "Aloqa", "phone": "+998 90 123 45 67", "telegram": "SupportBot" },
      "... YOU MUST ADD AT LEAST 15-20 MORE BLOCKS HERE (features, testimonials, pricing, etc) ..."
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
      { "id": "m6", "type": "quiz", "title": "Interactive Quiz", "questions": [ { "q": "Formula?", "options": ["A", "B"] } ] },
      "... YOU MUST ADD AT LEAST 15-20 MORE BLOCKS HERE (profile, orders history, settings, etc) ..."
    ]
  }
}

IF THE USER WANTS BOTH "BOT" AND "MINI_APP" AT THE SAME TIME:
{
  "explanation": "Project successfully generated!",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "bot_and_mini_app",
  "project_data": {
    "appName": "Unified Project",
    "theme": "glassmorphism",
    "themeColor": "#10b981",
    "bot_blocks": [
      { "id": "node1", "type": "boshlash", "title": "Boshlash", "text": "Start node" },
      { "id": "node2", "type": "xabar", "title": "Welcome", "buttons": [{"text": "Menu", "target_node": "node3"}] },
      "... YOU MUST ADD AT LEAST 15-20 MORE NODES HERE ...",
      "CRITICAL: ALL buttons in bot blocks MUST be objects containing 'text' and 'target_node' (the ID of the block it leads to) to ensure proper branching!"
    ],
    "site_blocks": [
      { "id": "m1", "type": "hero", "title": "Interactive Header", "subtitle": "Description", "img": "url" },
      "... YOU MUST ADD AT LEAST 15-20 MORE BLOCKS HERE FOR THE MINI APP ..."
    ]
  }
}

DYNAMIC / CUSTOM FEATURES:
If the user asks for a very specific block or feature for the MINI APP (e.g. Calendar, Calculator, Interactive Map, Pricing Table, Advanced Graph) that is NOT covered by the standard types (hero, catalog, form, quiz, etc.), you MUST create it yourself on the fly using the "custom_html" type.
{
  "id": "custom1",
  "type": "custom_html",
  "title": "Custom Feature Name",
  "html": "<div class='dynamic-container'>... raw HTML elements ...</div>",
  "css": ".dynamic-container { padding: 10px; color: white; }"
}

DYNAMIC BOT LOGIC:
If the user asks for advanced BOT logic (e.g. math calculation, random numbers, external API calls, custom validation), you MUST generate a "custom_code" node. Write raw JavaScript in the "code" field. You have access to "ctx", "variables", and can modify "variables" directly.
{
  "id": "node99",
  "type": "custom_code",
  "title": "Complex Logic",
  "code": "const random = Math.floor(Math.random() * 100); variables.random_num = random; await ctx.reply('Generated: ' + random);"
}

3. PATCH (PROJECT CONTROL) MODE
If the user asks to modify an EXISTING project and the change is small (e.g., "change the theme color to red", "add a new button to block 2", "change text of the third bot node"), you must issue a patch operation.
The frontend supports standard RFC6902 JSON Patch. Use absolute paths like '/bot_blocks/2/title' or '/site_blocks/1/buttons/0/text'.
If the user asks for MASSIVE changes (e.g., "rewrite the entire logic", "add 30 blocks"), DO NOT USE PATCH. Instead, issue a FULL_GENERATION!
{
  "explanation": "I've added the button as you requested and changed the color to red.",
  "execution_mode": "PATCH",
  "patch_operations": [
    { "op": "replace", "path": "/themeColor", "value": "#ef4444" },
    { "op": "add", "path": "/bot_blocks/1/buttons/-", "value": { "text": "Yangi", "target_node": "node9" } },
    { "op": "replace", "path": "/site_blocks/0/title", "value": "Yangi Sarlavha" }
  ]
}

OUTPUT FORMAT (EXTREMELY STRICT):
You MUST output ONLY a single, raw, valid JSON object. 
DO NOT include any markdown formatting like \`\`\`json. 
DO NOT output any conversational text before or after the JSON. 
If you fail to return perfectly parsable JSON, the entire system will crash.
`;

    try {
      // Keep only last 4 messages and strip huge JSON payloads from assistant to avoid TPM limits
      const formattedHistory: any[] = chatHistory.slice(-4).map(msg => {
        let content = msg.content;
        if (msg.role === 'agent') {
          try {
            // Extract only the explanation to save thousands of tokens
            const parsed = JSON.parse(content);
            if (parsed.explanation) {
              content = `{"explanation": "${parsed.explanation}", "note": "[Project data omitted to save tokens. Refer to CURRENT CONFIGURATION for the active state.]"}`;
            }
          } catch (e) {
            if (content.length > 500) content = content.substring(0, 500) + '...';
          }
        }
        return {
          role: msg.role === 'agent' ? 'assistant' : 'user',
          content: content
        };
      });

      const makeRequest = async (modelName: string) => {
        if (this.genAI) {
          const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro", "gemini-pro"];
          
          let historyText = formattedHistory.map(h => `${h.role === 'assistant' ? 'AI' : 'User'}: ${h.content}`).join('\n\n');
          const finalPrompt = `${systemInstruction}\n\n=== CHAT HISTORY ===\n${historyText}\n\nUser: ${userPrompt}\n\nOUTPUT ONLY VALID JSON:`;
          
          let lastError: any = null;
          for (const modelName of modelsToTry) {
            try {
              const model = this.genAI.getGenerativeModel({ model: modelName });
              const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
                generationConfig: {
                  temperature: 0.5,
                  responseMimeType: "application/json"
                }
              });
              return { choices: [{ message: { content: result.response.text() } }] };
            } catch (err: any) {
              lastError = err;
              this.logger.warn(`Gemini model ${modelName} failed: ${err.message}. Trying next model...`);
            }
          }
          throw lastError;
        } else {
          // Use Groq
          return await this.groq.chat.completions.create({
            messages: [
              { role: 'system', content: systemInstruction },
              ...formattedHistory,
              { role: 'user', content: userPrompt }
            ],
            model: modelName,
            temperature: 0.5,
            max_tokens: 8000,
            response_format: { type: 'json_object' },
          });
        }
      };

      let completion;
      try {
        completion = await makeRequest('llama-3.3-70b-versatile');
      } catch (e: any) {
        if (this.genAI) throw e; // Gemini doesn't need fallback
        if (e?.status === 413 || e?.status === 429 || e?.message?.includes('too large') || e?.message?.includes('tokens')) {
          this.logger.warn(`Llama-3.3-70b rate limit exceeded (TPM). Falling back to llama-3.1-8b-instant which has a higher 30,000 TPM limit...`);
          completion = await makeRequest('llama-3.1-8b-instant');
        } else {
          throw e;
        }
      }

      const rawText = completion.choices[0]?.message?.content || '';
      const cleanedJson = this.cleanJsonResponse(rawText);
      const parsed = JSON.parse(cleanedJson);

      // Clean up string comments from blocks arrays to prevent UI crash
      if (parsed.project_data) {
        if (Array.isArray(parsed.project_data.blocks)) {
          parsed.project_data.blocks = parsed.project_data.blocks.filter((b: any) => typeof b === 'object' && b !== null);
        }
        if (Array.isArray(parsed.project_data.bot_blocks)) {
          parsed.project_data.bot_blocks = parsed.project_data.bot_blocks.filter((b: any) => typeof b === 'object' && b !== null);
        }
        if (Array.isArray(parsed.project_data.site_blocks)) {
          parsed.project_data.site_blocks = parsed.project_data.site_blocks.filter((b: any) => typeof b === 'object' && b !== null);
        }
      }

      return parsed;
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
      const makeRequest = async (modelName: string) => {
        if (this.genAI) {
          const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro", "gemini-pro"];
          
          const finalPrompt = `${systemInstruction}\n\nUser: ${userPrompt}\n\nOUTPUT ONLY VALID JSON:`;
          
          let lastError: any = null;
          for (const modelName of modelsToTry) {
            try {
              const model = this.genAI.getGenerativeModel({ model: modelName });
              const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
                generationConfig: {
                  temperature: 0.5,
                  responseMimeType: "application/json"
                }
              });
              return { choices: [{ message: { content: result.response.text() } }] };
            } catch (err: any) {
              lastError = err;
              this.logger.warn(`Gemini model ${modelName} failed for patch: ${err.message}. Trying next model...`);
            }
          }
          throw lastError;
        } else {
          // Use Groq
          return await this.groq.chat.completions.create({
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: userPrompt }
            ],
            model: modelName,
            temperature: 0.5,
            response_format: { type: 'json_object' },
          });
        }
      };

      let completion;
      try {
        completion = await makeRequest('llama-3.3-70b-versatile');
      } catch (e: any) {
        if (this.genAI) throw e;
        if (e?.status === 413 || e?.status === 429 || e?.message?.includes('too large') || e?.message?.includes('tokens')) {
          this.logger.warn(`Llama-3.3-70b rate limit exceeded for patch. Falling back to llama-3.1-8b-instant...`);
          completion = await makeRequest('llama-3.1-8b-instant');
        } else {
          throw e;
        }
      }

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
