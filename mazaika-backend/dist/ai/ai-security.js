"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiSecurityService = void 0;
const common_1 = require("@nestjs/common");
class AiSecurityService {
    static logger = new common_1.Logger(AiSecurityService.name);
    static INJECTION_PATTERNS = [
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
    static sanitizeUserInput(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }
        const normalizedInput = input.trim();
        for (const pattern of this.INJECTION_PATTERNS) {
            if (pattern.test(normalizedInput)) {
                this.logger.warn(`🚨 Prompt injection attempt detected: "${normalizedInput}"`);
                throw new Error('SECURITY_VIOLATION: Invalid input detected.');
            }
        }
        if (normalizedInput.length > 2000) {
            this.logger.warn(`🚨 Input too long (potential buffer/token attack), truncating.`);
            return normalizedInput.substring(0, 2000) + '...';
        }
        return normalizedInput;
    }
}
exports.AiSecurityService = AiSecurityService;
//# sourceMappingURL=ai-security.js.map