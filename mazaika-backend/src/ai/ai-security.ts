import { Logger } from '@nestjs/common';

export class AiSecurityService {
  private static readonly logger = new Logger(AiSecurityService.name);

  // Blacklist of dangerous keywords/phrases commonly used in prompt injection
  private static readonly INJECTION_PATTERNS = [
    /ignore (all )?(previous )?instructions/i,
    /forget (all )?(previous )?instructions/i,
    /забудь (все )?(предыдущие )?инструкции/i,
    /игнорируй (все )?(предыдущие )?команды/i,
    /system prompt/i,
    /системный промпт/i,
    /developer mode/i,
    /режим разработчика/i,
    /bypass/i,
    /you are now a/i,
    /ты теперь/i,
    /sudo/i,
    /drop table/i
  ];

  /**
   * Validates and sanitizes the user input.
   * Throws an error or returns a sanitized fallback if an injection is detected.
   */
  static sanitizeUserInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    const normalizedInput = input.trim();

    // Check for injection patterns
    for (const pattern of this.INJECTION_PATTERNS) {
      if (pattern.test(normalizedInput)) {
        this.logger.warn(`🚨 Prompt injection attempt detected: "${normalizedInput}"`);
        throw new Error('SECURITY_VIOLATION: Invalid input detected.');
      }
    }

    // Additional sanitization: remove extreme repetition or overly long gibberish
    if (normalizedInput.length > 2000) {
      this.logger.warn(`🚨 Input too long (potential buffer/token attack), truncating.`);
      return normalizedInput.substring(0, 2000) + '...';
    }

    return normalizedInput;
  }
}
