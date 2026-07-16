import { Module } from '@nestjs/common';
import { BotController } from './bot.controller';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { BotManagerService } from './bot-manager.service';
import { TimerSchedulerService } from './timer-scheduler.service';

@Module({
  controllers: [BotController, WorkflowController],
  providers: [WorkflowService, BotManagerService, TimerSchedulerService],
})
export class BotModule {}

