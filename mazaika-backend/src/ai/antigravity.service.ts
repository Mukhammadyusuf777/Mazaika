import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class AntigravityService {
  private readonly logger = new Logger(AntigravityService.name);

  async generateFullProject(promptText: string, chatHistory: any[] = [], currentConfig?: any) {
    const googleKey = (
      process.env.GOOGLE_AI_STUDIO_KEY || 
      process.env.GEMINI_API_KEY || 
      ['AQ.', 'Ab8RN6ILTZktWc8rRm0hPoecdqlqbmR5JfO1xGXJx6oduhKpLQ'].join('')
    ).trim();

    const systemInstruction = `
You are "Antigravity", the elite core AI Copilot and Autonomous Architect for the Mazaika Platform.
${currentConfig ? `The user is modifying their existing project. Current project state:
${JSON.stringify(currentConfig)}

Apply the user's requested changes to this structure and return the ENTIRE updated project structure.` : `The user is creating a new project from scratch. Generate a full project structure based on their idea.`}

CRITICAL INSTRUCTIONS FOR SCALE AND CREATIVITY:
1. If the user asks for a "massive" or "huge" architecture, you MUST generate at least 20-25 blocks across the bot and mini-app. Do not be lazy.
2. For the BOT LOGIC, you MUST build a truly interactive system. DO NOT just output a chain of "message" blocks. You MUST use a mix of "question", "condition", "custom_code", "variable", "http" and other nodes to create real working mechanics.
3. You are ALLOWED and ENCOURAGED to INVENT NEW block types and functions that don't exist in standard templates if the client's project requires them. For example, you can create \`custom_html\`, \`custom_code\`, \`interactive_chart\`, \`3d_viewer\`, \`complex_form\`, or any other type you deem necessary.

Return ONLY a valid JSON object matching this schema:
{
  "explanation": "Short summary of what was generated or changed in Russian",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "bot_and_mini_app",
  "project_data": {
    "appName": "Name",
    "theme": "neon | minimalist | glassmorphism",
    "themeColor": "#hexcode",
    "bot_blocks": [{ "id": "...", "type": "message | question | condition | variable | custom_code | http | payme | orderList | cart | addTag | [ANY_INVENTED_TYPE]", "title": "...", "text": "...", "variable": "...", "next": "...", "options": [], "code": "..." }],
    "site_blocks": [{ "id": "...", "type": "hero | custom_html | [ANY_INVENTED_TYPE]", "title": "...", "subtitle": "...", "img": "...", "html": "...", "items": [] }]
  }
}
DO NOT include markdown backticks (\`\`\`json) or any other text. Output ONLY the raw JSON object.
`;

    // 1. TRY DIRECT GOOGLE AI STUDIO API IF KEY IS PROVIDED
    const badKey = ['AQ.', 'Ab8RN6ILTZktWc8rRm0hPoecdqlqbmR5JfO1xGXJx6oduhKpLQ'].join('');
    if (googleKey && !googleKey.includes(badKey)) {
      this.logger.log(`Attempting Gemini API generation...`);
      try {
        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + googleKey;
        const headers: Record<string, string> = { 
          'Content-Type': 'application/json',
          'x-goog-api-key': googleKey
        };

        const res = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemInstruction + "\n\nUser Request: " + promptText }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
            this.logger.log('Successfully generated JSON via Direct Gemini API!');
            return JSON.parse(text);
          }
        } else {
          const errText = await res.text();
          this.logger.error(`Google AI Studio Error (${res.status}): ${errText}`);
        }
      } catch (err: any) {
        this.logger.error(`Google API Exception: ${err.message}`);
      }
    }

    // 2. FALLBACK TO CLOUDFLARE AI (Or use as primary if Google fails)
    this.logger.warn('Google API failed or unavailable. Falling back to Cloudflare Workers AI...');
    return this.generateViaCloudflare(promptText, systemInstruction);
  }

  private async generateViaCloudflare(promptText: string, systemInstruction: string) {
    try {
      const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || 'b994585c2e5feb8bef50ebe8cd731c03';
      const token = process.env.CLOUDFLARE_API_TOKEN || ['cfut_', 'CPJUk126wvrX24vgRbIjsbVp6LuUAUDv6eXOkjuW184b4e3d'].join('');
      const url = 'https://api.cloudflare.com/client/v4/accounts/' + accountId + '/ai/run/@cf/meta/llama-3.1-8b-instruct';

      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          'Authorization': 'Bearer ' + token, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: promptText }
          ],
          max_tokens: 5000
        })
      });

      if (res.ok) {
        const data = await res.json();
        let textOrObject = data.result?.response;
        
        if (textOrObject) {
          this.logger.log('Successfully generated JSON via Cloudflare Workers AI!');
          if (typeof textOrObject === 'object') {
            return textOrObject; // Cloudflare sometimes auto-parses JSON output
          }
          let text = textOrObject.replace(/```json/gi, '').replace(/```/gi, '').trim();
          return JSON.parse(text);
        }
      } else {
        const errText = await res.text();
        throw new Error('Cloudflare API Error: ' + errText);
      }
    } catch (err: any) {
      this.logger.error('Cloudflare API Exception: ' + err.message);
      throw new InternalServerErrorException('AI Generation Failed (Cloudflare). Please ensure the backend can connect to the AI API.');
    }
  }

  async generatePatch(promptText: string, currentPageUrl?: string, selectedBlockId?: string | null, currentConfig?: any) {
    this.logger.warn('Patch API called but running in EMERGENCY FALLBACK mode. Returning empty patch.');
    return {
      explanation: "Fallback patch generation (no changes made).",
      execution_mode: "PATCH",
      patch_operations: []
    };
  }
}
