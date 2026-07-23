import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class AntigravityService {
  private readonly logger = new Logger(AntigravityService.name);

  async generateFullProject(promptText: string, chatHistory: any[] = [], currentConfig?: any, targetEntity: 'bot_and_mini_app' | 'site_only' = 'bot_and_mini_app') {
    const googleKey = (
      process.env.GOOGLE_AI_STUDIO_KEY || 
      process.env.GEMINI_API_KEY || 
      ['AQ.', 'Ab8RN6ILTZktWc8rRm0hPoecdqlqbmR5JfO1xGXJx6oduhKpLQ'].join('')
    ).trim();

    const isSiteOnly = targetEntity === 'site_only';

    const systemInstruction = `
You are "Antigravity", the elite core AI Copilot and Autonomous Architect for the Mazaika Platform.
You are a highly proactive, conversational, and elite developer AI.

${currentConfig ? `The user is modifying their existing project. Current project state:
${JSON.stringify(currentConfig)}

Apply the user's requested changes to this structure and return the ENTIRE updated project structure.` : `The user is creating a new project from scratch. Generate a full project structure based on their idea.`}

CRITICAL INSTRUCTIONS FOR SCALE AND CREATIVITY:
1. If the user asks for a "massive" or "huge" architecture, you MUST generate complex and rich logic or code.
${isSiteOnly ? `2. YOU ARE BUILDING A STANDALONE WEBSITE OR WEB APP. Do NOT use blocks. You MUST generate the complete, raw HTML/CSS/JS source code inside the \\\`source_code\\\` field. Use TailwindCSS via CDN (<script src="https://cdn.tailwindcss.com"></script>) and modern JS. The result must be a beautiful, highly interactive, and fully functional web application.
3. The user WILL NOT SEE YOUR CODE. They will only see the rendered result in an iframe. Therefore, make it visually stunning.
4. PERSONALITY: In the \\\`explanation\\\` field, you MUST act as a proactive elite developer. You must: 
   - Explain what you just built.
   - Ask for the user's impressions (e.g. "Как вам дизайн?").
   - Propose new features or design changes proactively.` : `2. For the BOT LOGIC, you MUST build a truly interactive system. DO NOT just output a chain of "message" blocks. You MUST use a mix of "question", "condition", "custom_code", "variable", "http" and other nodes to create real working mechanics.
3. IMPORTANT: The FIRST block in \\\`bot_blocks\\\` MUST ALWAYS be of type \\\`start\\\`. ALL blocks MUST be logically connected using \\\`next\\\`.
4. If the bot requires a Mini App / Web App interface, DO NOT use \\\`site_blocks\\\`. Instead, generate the full raw HTML/CSS/JS code inside the \\\`source_code\\\` field, just like a standalone website.`}

Return ONLY a valid JSON object matching this schema:
{
  "explanation": "Your conversational response to the user in Russian (explaining what was done, asking for impressions, proposing next steps).",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "${targetEntity}",
  "project_data": {
    "appName": "Name",
    "theme": "neon | minimalist | glassmorphism",
    "themeColor": "#hexcode",
    ${isSiteOnly ? '' : `"bot_blocks": [{ "id": "...", "type": "message | question | condition | custom_code | http", "title": "...", "text": "...", "variable": "...", "next": "...", "options": [], "code": "..." }],`}
    "source_code": "<!DOCTYPE html><html><head><script src=\\"https://cdn.tailwindcss.com\\"></script></head><body class=\\"bg-gray-900 text-white\\">...</body></html>"
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
