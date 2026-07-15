import { Module } from '@nestjs/common';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { BotManagerService } from './bot-manager.service';

@Module({
  controllers: [BotController, WorkflowController],
  providers: [BotService, WorkflowService, BotManagerService],
})
export class BotModule {}
