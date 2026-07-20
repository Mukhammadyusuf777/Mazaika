import { Controller, Post, Body } from '@nestjs/common';
import { AntigravityService } from './antigravity.service';

export class GenerateDto {
  prompt: string;
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
    return this.antigravityService.generateFullProject(dto.prompt);
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
