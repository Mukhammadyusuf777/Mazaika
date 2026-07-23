import { AntigravityService } from './antigravity.service';
export declare class GenerateDto {
    prompt: string;
    chatHistory?: {
        role: string;
        content: string;
    }[];
    currentConfig?: any;
    targetEntity?: 'bot_and_mini_app' | 'site_only';
}
export declare class PatchDto {
    prompt: string;
    currentPage?: string;
    selectedBlockId?: string | null;
    currentConfig?: any;
}
export declare class AiController {
    private readonly antigravityService;
    constructor(antigravityService: AntigravityService);
    generateFullProject(dto: GenerateDto): Promise<any>;
    generatePatch(dto: PatchDto): Promise<any>;
}
