import { AntigravityService } from './antigravity.service';
export declare class GenerateDto {
    prompt?: string;
    message?: string;
    text?: string;
    promptText?: string;
    chatHistory?: {
        role: string;
        content: string;
    }[];
    currentConfig?: any;
    targetEntity?: 'bot_and_mini_app' | 'site_only';
}
export declare class PatchDto {
    prompt?: string;
    currentPage?: string;
    selectedBlockId?: string | null;
    currentConfig?: any;
}
export declare class AiController {
    private readonly antigravityService;
    private readonly logger;
    constructor(antigravityService: AntigravityService);
    generateFullProject(body: any): Promise<any>;
    generatePatch(body: any): Promise<any>;
}
