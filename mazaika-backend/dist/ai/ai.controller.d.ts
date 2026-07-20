import { AntigravityService } from './antigravity.service';
export declare class GenerateDto {
    prompt: string;
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
    generateFullProject(dto: GenerateDto): Promise<import("./antigravity.service").FullGenerationResponse>;
    generatePatch(dto: PatchDto): Promise<import("./antigravity.service").PatchResponse>;
}
