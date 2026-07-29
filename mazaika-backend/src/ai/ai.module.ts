import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AntigravityService } from './antigravity.service';
import { CloudModule } from '../cloud/cloud.module';

@Module({
  imports: [CloudModule],
  controllers: [AiController],
  providers: [AntigravityService],
  exports: [AntigravityService],
})
export class AiModule {}
