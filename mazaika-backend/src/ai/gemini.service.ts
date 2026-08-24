import { Injectable, Logger } from '@nestjs/common';
import { MAZAIKA_SYSTEM_PROMPT } from './gemini-system-instruction';
import { AiSecurityService } from './ai-security';

export interface GeminiResponse {
  intent: string;
  reply_text: string;
  action_required: boolean;
  confidence_score: number;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly MAX_RETRIES = 3;
  private readonly MAX_HISTORY_LENGTH = 10;

  constructor() {}

  /**
   * Compresses the conversation history to stay within token limits.
   */
  private compactContext(history: { role: string; content: string }[]): { role: string; content: string }[] {
    if (!history || history.length <= this.MAX_HISTORY_LENGTH) {
      return history || [];
    }
    this.logger.debug(`🗜 Compacting chat history from ${history.length} to ${this.MAX_HISTORY_LENGTH} messages.`);
    // Keep the most recent messages
    return history.slice(-this.MAX_HISTORY_LENGTH);
  }

  /**
   * Generates a response using the Gemini API with exponential backoff and fallback.
   */
  async generateResponse(userInput: string, chatHistory: any[] = []): Promise<GeminiResponse> {
    try {
      // Step 1: Security check
      const sanitizedInput = AiSecurityService.sanitizeUserInput(userInput);
      const compactedHistory = this.compactContext(chatHistory);

      // Step 2: Attempt to call Gemini API with Retries
      return await this.callGeminiWithRetry(sanitizedInput, compactedHistory);

    } catch (error) {
      this.logger.error(`❌ Gemini Service Error: ${error.message}`);
      
      // Step 3: Fallback Strategy if Gemini completely fails or security blocks it
      return this.executeFallbackStrategy(error);
    }
  }

  private async callGeminiWithRetry(
    input: string, 
    history: any[], 
    attempt = 1
  ): Promise<GeminiResponse> {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is missing.');
      }

      const payload = {
        contents: [
          { role: 'user', parts: [{ text: MAZAIKA_SYSTEM_PROMPT }] }, // System prompt injected here for simplicity
          ...history.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          })),
          { role: 'user', parts: [{ text: input }] }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 429 || response.status >= 500) {
          throw new Error(`HTTP_${response.status}`);
        }
        throw new Error(`Gemini API Error: ${response.statusText}`);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      return JSON.parse(textResponse) as GeminiResponse;

    } catch (error) {
      if (attempt < this.MAX_RETRIES && (error.message.includes('HTTP_429') || error.message.includes('HTTP_5'))) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        this.logger.warn(`⚠️ Gemini API rate limited or internal error. Retrying in ${delay}ms (Attempt ${attempt + 1}/${this.MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.callGeminiWithRetry(input, history, attempt + 1);
      }
      throw error; // Max retries reached or unrecoverable error
    }
  }

  private executeFallbackStrategy(error: any): GeminiResponse {
    this.logger.log('🛡 Executing Fallback Strategy...');
    
    let fallbackMessage = "Извините, в данный момент сервер перегружен. Пожалуйста, попробуйте позже.";
    let intent = "fallback_error";

    if (error.message.includes('SECURITY_VIOLATION')) {
      fallbackMessage = "Ваш запрос был заблокирован системой безопасности. Пожалуйста, задавайте вопросы только по теме бизнеса и платформы Mazaika.";
      intent = "malicious";
    }

    return {
      intent,
      reply_text: fallbackMessage,
      action_required: false,
      confidence_score: 1.0
    };
  }
}
