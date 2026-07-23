export declare class AntigravityService {
    private readonly logger;
    generateFullProject(promptText: string, chatHistory?: any[], currentConfig?: any, targetEntity?: 'bot_and_mini_app' | 'site_only'): Promise<any>;
    private generateViaCloudflare;
    generatePatch(promptText: string, currentPageUrl?: string, selectedBlockId?: string | null, currentConfig?: any): Promise<{
        explanation: string;
        execution_mode: string;
        patch_operations: never[];
    }>;
}
