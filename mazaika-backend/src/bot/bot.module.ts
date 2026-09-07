import { Module, forwardRef } from '@nestjs/common';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { BotManagerService } from './bot-manager.service';
import { TimerSchedulerService } from './timer-scheduler.service';
import { CloudModule } from '../cloud/cloud.module';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [CloudModule, forwardRef(() => FirebaseModule)],
  controllers: [BotController, WorkflowController, SiteController],
  providers: [
    BotService,
    SiteService,
    WorkflowService,
    BotManagerService,
    TimerSchedulerService,
  ],
  exports: [BotManagerService, BotService, SiteService],
})
export class BotModule {}
