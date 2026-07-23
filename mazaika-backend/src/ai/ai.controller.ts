import { Controller, Post, Body } from '@nestjs/common';
import { AntigravityService } from './antigravity.service';

export class GenerateDto {
  prompt: string;
  chatHistory?: { role: string; content: string }[];
  currentConfig?: any;
  targetEntity?: 'bot_and_mini_app' | 'site_only';
}

export class PatchDto {
  prompt: string;
  currentPage?: string;
  selectedBlockId?: string | null;
  currentConfig?: any;
}

@Controller('api/ai')
export class AiController {
  constructor(private readonly antigravityService: AntigravityService) {}

  @Post('generate')
  async generateFullProject(@Body() dto: GenerateDto) {
    return this.antigravityService.generateFullProject(dto.prompt, dto.chatHistory, dto.currentConfig, dto.targetEntity);
  }

  @Post('patch')
  async generatePatch(@Body() dto: PatchDto) {
    return this.antigravityService.generatePatch(
      dto.prompt,
      dto.currentPage,
      dto.selectedBlockId,
      dto.currentConfig
    );
  }
}
