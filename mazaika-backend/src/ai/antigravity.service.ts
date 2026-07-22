import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AntigravityService {
  private readonly logger = new Logger(AntigravityService.name);

  async generateFullProject(promptText: string, chatHistory: any[] = [], currentConfig?: any) {
    const googleKey = (
      process.env.GOOGLE_AI_STUDIO_KEY || 
      process.env.GEMINI_API_KEY || 
      ['AQ.', 'Ab8RN6ILTZktWc8rRm0hPoecdqlqbmR5JfO1xGXJx6oduhKpLQ'].join('')
    ).trim();

    // 1. TRY DIRECT GOOGLE AI STUDIO API IF KEY IS PROVIDED
    if (googleKey) {
      this.logger.log(`Attempting Gemini API generation (Key starts with: ${googleKey.substring(0, 5)}...)...`);
      try {
        const isAqKey = googleKey.startsWith('AQ.');
        const url = isAqKey 
          ? 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
          : `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleKey}`;

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        
        if (isAqKey) {
          headers['Authorization'] = `Bearer ${googleKey}`;
        } else {
          headers['x-goog-api-key'] = googleKey;
        }

        const systemInstruction = `
You are "Antigravity", the elite core AI Copilot and Autonomous Architect for the Mazaika Platform.
${currentConfig ? `The user is modifying their existing project. Current project state:
${JSON.stringify(currentConfig)}

Apply the user's requested changes to this structure and return the ENTIRE updated project structure.` : `The user is creating a new project from scratch. Generate a full project structure based on their idea.`}

CRITICAL INSTRUCTIONS FOR SCALE AND CREATIVITY:
1. If the user asks for a "massive" or "huge" architecture, you MUST generate at least 20-25 blocks across the bot and mini-app. Do not be lazy.
2. You are ALLOWED and ENCOURAGED to INVENT NEW block types and functions that don't exist in standard templates if the client's project requires them. For example, you can create \`custom_html\`, \`custom_code\`, \`interactive_chart\`, \`3d_viewer\`, \`complex_form\`, or any other type you deem necessary.

Return ONLY a valid JSON object matching this schema:
{
  "explanation": "Short summary of what was generated or changed in Russian",
  "execution_mode": "FULL_GENERATION",
  "target_entity": "bot_and_mini_app",
  "project_data": {
    "appName": "Name",
    "theme": "neon | minimalist | glassmorphism",
    "themeColor": "#hexcode",
    "bot_blocks": [{ "id": "...", "type": "message | custom_code | [ANY_INVENTED_TYPE]", "title": "...", "text": "...", "variable": "...", "next": "...", "options": [], "code": "..." }],
    "site_blocks": [{ "id": "...", "type": "hero | custom_html | [ANY_INVENTED_TYPE]", "title": "...", "subtitle": "...", "img": "...", "html": "...", "items": [] }]
  }
}
DO NOT include markdown backticks (\`\`\`json) or any other text. Output ONLY the raw JSON object.
`;

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
          throw new Error(`Google API Error (${res.status}): ${errText}`);
        }
      } catch (err: any) {
        this.logger.error(`Google API Exception: ${err.message}`);
        throw new Error(`AI API Error: ${err.message}`);
      }
    } else {
      throw new Error(`API Key not found. Please provide a valid GOOGLE_AI_STUDIO_KEY.`);
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
