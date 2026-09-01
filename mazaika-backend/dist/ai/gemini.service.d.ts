export interface GeminiResponse {
    intent: string;
    reply_text: string;
    action_required: boolean;
    confidence_score: number;
}
export declare class GeminiService {
    private readonly logger;
    private readonly MAX_RETRIES;
    private readonly MAX_HISTORY_LENGTH;
    constructor();
    private compactContext;
    generateResponse(userInput: string, chatHistory?: any[]): Promise<GeminiResponse>;
    private callGeminiWithRetry;
    private executeFallbackStrategy;
}
