import { AntigravityService } from './antigravity.service';
export declare class GenerateDto {
    prompt: string;
    chatHistory?: {
        role: string;
        content: string;
    }[];
    currentConfig?: any;
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
    generatePatch(dto: PatchDto): Promise<{
        explanation: string;
        execution_mode: string;
        patch_operations: never[];
    }>;
}
