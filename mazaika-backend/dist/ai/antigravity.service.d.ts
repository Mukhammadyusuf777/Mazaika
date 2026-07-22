export declare class AntigravityService {
    private readonly logger;
    generateFullProject(promptText: string, chatHistory?: any[], currentConfig?: any): Promise<any>;
    private generateViaCloudflare;
    generatePatch(promptText: string, currentPageUrl?: string, selectedBlockId?: string | null, currentConfig?: any): Promise<{
        explanation: string;
        execution_mode: string;
        patch_operations: never[];
    }>;
}
