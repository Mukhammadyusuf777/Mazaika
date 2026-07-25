export interface GenerateDto {
    prompt: string;
    currentHtml?: string;
    imageBase64?: string;
    imageMimeType?: string;
}
export declare class AntigravityService {
    private readonly logger;
    generate(rawInput: any): Promise<any>;
    generateFullProject(rawInput: any, chatHistory?: any[], currentConfig?: any, targetEntity?: 'bot_and_mini_app' | 'site_only'): Promise<any>;
    private callGemini;
    generatePatch(promptText: string, currentPageUrl?: string, selectedBlockId?: string | null, currentConfig?: any): Promise<any>;
    private formatResponse;
    private callCloudflareAI;
    private extractJsonObject;
}
