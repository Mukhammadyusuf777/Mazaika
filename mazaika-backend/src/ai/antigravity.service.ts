import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class AntigravityService {
  private readonly logger = new Logger(AntigravityService.name);

  async generateFullProject(promptText: string, chatHistory: any[] = [], currentConfig?: any, targetEntity: 'bot_and_mini_app' | 'site_only' = 'bot_and_mini_app') {
    const googleKey = (
      process.env.GOOGLE_AI_STUDIO_KEY ||
      process.env.GEMINI_API_KEY ||
      ''
    ).trim();

    const isSiteOnly = targetEntity === 'site_only';

    const historyContext = chatHistory.length > 0
      ? `\n\nPrevious conversation for context:\n${chatHistory.map(m => `${m.role === 'user' ? 'User' : 'Antigravity'}: ${m.content}`).join('\n')}\n`
      : '';

    const currentConfigContext = currentConfig
      ? `\n\nThe user is MODIFYING their existing project. Current state:\n${JSON.stringify(currentConfig, null, 2)}\n\nApply user changes and return COMPLETE updated project.`
      : `\n\nThe user is creating a NEW project from scratch.`;

    const systemInstruction = isSiteOnly
      ? this.buildSitePrompt(historyContext, currentConfigContext)
      : this.buildBotPrompt(historyContext, currentConfigContext);

    this.logger.log(`Generating for target: ${targetEntity}, mode: ${currentConfig ? 'MODIFY' : 'CREATE'}`);

    // 1. TRY GOOGLE GEMINI API
    if (googleKey && googleKey.length > 20) {
      this.logger.log(`Attempting Gemini API generation...`);
      try {
        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=' + googleKey;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemInstruction + '\n\n--- USER REQUEST ---\n' + promptText }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.7,
              maxOutputTokens: 8192,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = this.extractJsonObject(text);
            if (parsed) {
              this.logger.log('Successfully generated via Gemini Pro!');
              return parsed;
            }
          }
        } else {
          const errText = await res.text();
          this.logger.error(`Gemini API Error (${res.status}): ${errText.substring(0, 300)}`);
        }
      } catch (err: any) {
        this.logger.error(`Gemini API Exception: ${err.message}`);
      }
    }
    // 2. TRY OPENROUTER API
    const openrouterKey = (process.env.OPENROUTER_API_KEY || '').trim();
    if (openrouterKey && openrouterKey.length > 10) {
      this.logger.log(`Attempting OpenRouter API generation...`);
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + openrouterKey,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://mazaika.uz',
            'X-Title': 'Mazaika AI Platform'
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash:free',
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: promptText }
            ],
            temperature: 0.7,
            max_tokens: 8192
          })
        });

        if (res.ok) {
          const data = await res.json();
          let text = data.choices?.[0]?.message?.content;
          if (text) {
            const parsed = this.extractJsonObject(text);
            if (parsed) {
              this.logger.log('Successfully generated via OpenRouter!');
              return parsed;
            }
          }
        } else {
          const errText = await res.text();
          this.logger.error(`OpenRouter API Error (${res.status}): ${errText.substring(0, 300)}`);
          // Try fallback model on OpenRouter if free model failed
          const resFallback = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + openrouterKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'meta-llama/llama-3.3-70b-instruct:free',
              messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: promptText }
              ],
              max_tokens: 8192
            })
          });
          if (resFallback.ok) {
            const dataF = await resFallback.json();
            let textF = dataF.choices?.[0]?.message?.content;
            if (textF) {
              const parsedF = this.extractJsonObject(textF);
              if (parsedF) {
                this.logger.log('Successfully generated via OpenRouter Fallback Model!');
                return parsedF;
              }
            }
          }
        }
      } catch (err: any) {
        this.logger.error(`OpenRouter API Exception: ${err.message}`);
      }
    }

    // 3. FALLBACK TO CLOUDFLARE AI
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
    const token = process.env.CLOUDFLARE_API_TOKEN || '';

    if (accountId && token) {
      return this.generateViaCloudflare(promptText, systemInstruction, accountId, token);
    }

    throw new InternalServerErrorException(
      'No AI API keys configured. Please set GOOGLE_AI_STUDIO_KEY or CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN in .env'
    );
  }

  private buildSitePrompt(historyContext: string, currentConfigContext: string): string {
    return `You are "Antigravity", an elite AI developer inside the Mazaika Platform. You are a senior developer who is proactive, enthusiastic, and always suggests improvements.
${historyContext}${currentConfigContext}

## YOUR TASK: BUILD A STANDALONE WEBSITE

Generate a COMPLETE, PRODUCTION-QUALITY standalone website as raw HTML/CSS/JS source code.

### STRICT RULES:
1. Generate a FULL single-page HTML file in the "source_code" field — not fragments, not placeholders.
2. Use TailwindCSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
3. The design MUST be visually stunning — use gradients, smooth animations, and modern UI patterns.
4. All content must be realistic and contextual — NEVER use "Lorem ipsum" or placeholder text.
5. Make it FULLY INTERACTIVE with JavaScript (smooth scroll, mobile menu, form validation, etc.)
6. MUST be fully mobile-responsive.
7. The user NEVER sees your code — only the rendered iframe result. Quality is everything.

### PERSONALITY (in your "explanation" field):
- Describe what you built and WHY you made certain design decisions.
- Ask for feedback: "Как вам такой дизайн?"
- Proactively suggest 2-3 improvements or features you could add next.
- Be conversational and enthusiastic in Russian.

### RESPONSE FORMAT — Return ONLY this valid JSON (no markdown, no backticks):
{
  "explanation": "Detailed conversational response in Russian. Explain what was built, ask for impressions, propose next steps.",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "site_only",
  "project_data": {
    "appName": "Site name here",
    "theme": "glassmorphism",
    "themeColor": "#hex",
    "source_code": "<!DOCTYPE html><html lang='uz'>...</html>"
  }
}`;
  }

  private buildBotPrompt(historyContext: string, currentConfigContext: string): string {
    return `You are "Antigravity", an elite AI developer inside the Mazaika Platform. You are a senior developer who is proactive and always suggests improvements.
${historyContext}${currentConfigContext}

## YOUR TASK: BUILD A TELEGRAM BOT WORKFLOW

Generate a COMPLETE, WORKING Telegram bot workflow as ReactFlow nodes and edges.

### CRITICAL NODE RULES:
1. Every node MUST have: "id" (string), "type" (string), "position" ({x:number, y:number}), "data" (object).
2. The FIRST node MUST be: id="node_start", type="start".
3. ALL text/config goes inside the "data" object — NEVER at the top level of a node.
4. Position nodes logically: start at x:100 y:150, space 300px apart horizontally, 200px for branches.
5. EVERY node must be reachable through edges — no orphan nodes!

### NODE TYPES & DATA STRUCTURE:
- start: data: { label:"Start", emoji:"▶", color:"#10d974", text:"Welcome message" }
- message: data: { label:"Message", emoji:"💬", color:"#1e90ff", text:"Text with {variable} support", buttons:["Option 1","Option 2"] }
- question: data: { label:"Question", emoji:"❓", color:"#f59e0b", text:"Question text?", variable:"var_name", buttons:["Choice A","Choice B"] }
- condition: data: { label:"Condition", emoji:"🔀", color:"#8b5cf6", variable:"var_name", operator:"==" (or "!=","contains",">","<","is_empty","is_filled"), value:"expected_value" }
- http: data: { label:"HTTP Request", emoji:"🌐", color:"#06b6d4", url:"https://api.example.com", method:"GET", variable:"result", jsonPath:"data.field" }
- variable: data: { label:"Set Variable", emoji:"📝", color:"#6366f1", variableName:"my_var", variableValue:"value or {other_var}" }
- phone: data: { label:"Phone", emoji:"📱", color:"#10b981", text:"Share your phone:", variable:"phone", buttonText:"📞 Share Phone" }
- email: data: { label:"Email", emoji:"📧", color:"#0ea5e9", text:"Enter your email:", variable:"email" }
- location: data: { label:"Location", emoji:"📍", color:"#ef4444", text:"Share your location:", variable:"location", buttonText:"📍 Share Location" }
- timer: data: { label:"Wait", emoji:"⏱", color:"#64748b", delayAmount:"5", delayUnit:"minutes" }
- addTag: data: { label:"Add Tag", emoji:"🏷", color:"#a855f7", tagName:"tag_name" }
- payme: data: { label:"Payment", emoji:"💳", color:"#16a34a", title:"Payment title", price:"50000", providerToken:"YOUR_PAYME_TOKEN" }

### CRITICAL EDGE RULES:
1. Every edge MUST have: "id", "source" (node id), "target" (node id), "type":"smoothstep", "animated":true, "style":{"stroke":"#1e90ff","strokeWidth":2}
2. For condition nodes: use "sourceHandle":"true" or "sourceHandle":"false"
3. For message nodes with buttons: use "sourceHandle":"btn_0", "sourceHandle":"btn_1", etc.
4. For question/phone/email/location: use "sourceHandle":"answered"
5. For all other transitions: use "sourceHandle":"out"
6. Edge id format: "edge_sourceId_targetId"

### RESPONSE FORMAT — Return ONLY this valid JSON (no markdown, no backticks):
{
  "explanation": "Detailed conversational response in Russian. Explain the bot logic step by step, ask for feedback, suggest improvements.",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "bot_and_mini_app",
  "project_data": {
    "appName": "Bot Name",
    "theme": "glassmorphism",
    "themeColor": "#1e90ff",
    "bot_blocks": [
      { "id": "node_start", "type": "start", "position": {"x":100,"y":150}, "data": {"label":"Start","emoji":"▶","color":"#10d974","text":"Salom! /start bilan boshlang."} },
      { "id": "node_2", "type": "message", "position": {"x":400,"y":150}, "data": {"label":"Xush kelibsiz","emoji":"💬","color":"#1e90ff","text":"Qanday yordam kerak?","buttons":["Katalog","Aloqa"]} }
    ],
    "bot_edges": [
      { "id": "edge_start_2", "source": "node_start", "target": "node_2", "sourceHandle": "out", "type": "smoothstep", "animated": true, "style": {"stroke":"#1e90ff","strokeWidth":2} }
    ]
  }
}

NOTE: Only include "source_code" in project_data if the bot explicitly needs a Mini App web interface.`;
  }

  private async generateViaCloudflare(promptText: string, systemInstruction: string, accountId: string, token: string) {
    const modelsToTry = [
      process.env.CLOUDFLARE_MODEL,
      '@cf/google/gemini-3.6-flash',
      '@cf/google/gemini-1.5-flash',
      '@cf/google/gemini-3.5-flash-lite',
      '@cf/xai/grok-4.5',
      '@cf/meta/llama-3.3-70b-instruct',
      '@cf/meta/llama-3.1-8b-instruct'
    ].filter(Boolean) as string[];

    let lastError = '';

    for (const model of modelsToTry) {
      try {
        this.logger.log(`Attempting Cloudflare AI generation with model: ${model}...`);
        const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: systemInstruction + '\n\n--- USER REQUEST ---\n' + promptText,
            max_tokens: 8192
          })
        });

        if (res.ok) {
          const data = await res.json();
          let textOrObject = data.result?.response || data.result;
          if (textOrObject) {
            this.logger.log(`Successfully generated via Cloudflare Workers AI (${model})!`);
            if (typeof textOrObject === 'object' && !Array.isArray(textOrObject)) return textOrObject;
            let text = typeof textOrObject === 'string' ? textOrObject : JSON.stringify(textOrObject);
            const parsed = this.extractJsonObject(text);
            if (parsed) {
              return parsed;
            }
            throw new Error('Cloudflare AI returned invalid JSON format: ' + text.substring(0, 100));
          }
        } else {
          const errText = await res.text();
          this.logger.warn(`Cloudflare model ${model} failed (${res.status}): ${errText.substring(0, 150)}`);
          lastError = errText;
        }
      } catch (err: any) {
        this.logger.warn(`Cloudflare model ${model} exception: ${err.message}`);
        lastError = err.message;
      }
    }

    throw new InternalServerErrorException('Cloudflare AI Generation Failed: ' + lastError);
  }

  async generatePatch(promptText: string, currentPageUrl?: string, selectedBlockId?: string | null, currentConfig?: any) {
    // Delegate patch to full generation for reliability
    this.logger.log('Patch mode: delegating to full generation for reliability.');
    return this.generateFullProject(promptText, [], currentConfig, 'bot_and_mini_app');
  }

  private extractJsonObject(text: string): any {
    if (!text) return null;
    let cleanText = text.replace(/```json/gi, '').replace(/```/gi, '').trim();

    try {
      return JSON.parse(cleanText);
    } catch (e) {}

    const startIdx = cleanText.indexOf('{');
    if (startIdx === -1) return null;

    let braceCount = 0;
    let inString = false;
    let isEscaped = false;

    for (let i = startIdx; i < cleanText.length; i++) {
      const char = cleanText[i];

      if (inString) {
        if (char === '\\' && !isEscaped) {
          isEscaped = true;
        } else {
          if (char === '"' && !isEscaped) {
            inString = false;
          }
          isEscaped = false;
        }
      } else {
        if (char === '"') {
          inString = true;
        } else if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            const candidate = cleanText.substring(startIdx, i + 1);
            try {
              return JSON.parse(candidate);
            } catch (e) {}
          }
        }
      }
    }

    const match = cleanText.match(/\{[\s\S]*?\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {}
    }

    return null;
  }
}
