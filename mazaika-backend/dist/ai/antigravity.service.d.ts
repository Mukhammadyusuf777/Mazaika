export declare class AntigravityService {
    private readonly logger;
    generate(rawPrompt: any): Promise<any>;
    generateFullProject(rawPrompt: any, chatHistory?: any[], currentConfig?: any, targetEntity?: 'bot_and_mini_app' | 'site_only'): Promise<any>;
    private generateViaCloudflare;
    generatePatch(promptText: string, currentPageUrl?: string, selectedBlockId?: string | null, currentConfig?: any): Promise<any>;
    private formatResponse;
    private generateMultiPageFailsafe;
    private extractJsonObject;
}
