export interface PatchOperation {
    op: 'replace' | 'add' | 'remove';
    path: string;
    value: any;
}
export interface FullGenerationResponse {
    explanation: string;
    appName: string;
    theme: string;
    themeColor: string;
    blocks: any[];
}
export interface PatchResponse {
    explanation: string;
    execution_mode: 'PATCH';
    patch_operations: PatchOperation[];
}
export declare class AntigravityService {
    private readonly logger;
    private genAI;
    private apiKey;
    constructor();
    generateFullProject(userPrompt: string): Promise<FullGenerationResponse>;
    generatePatch(userPrompt: string, currentPageUrl?: string, selectedBlockId?: string | null, currentConfig?: any): Promise<PatchResponse>;
    private cleanJsonResponse;
    private createFallbackFullProject;
    private createFallbackPatch;
}
