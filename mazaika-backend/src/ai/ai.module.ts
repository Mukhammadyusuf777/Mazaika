import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AntigravityService } from './antigravity.service';

@Module({
  controllers: [AiController],
  providers: [AntigravityService],
  exports: [AntigravityService],
})
export class AiModule {}
