import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { WorkflowService } from './workflow.service';
import { BotManagerService } from './bot-manager.service';

@Injectable()
export class TimerSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TimerSchedulerService.name);
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private workflowService: WorkflowService
  ) {}

  onModuleInit() {
    this.logger.log('Starting Timer Scheduler polling (every 10 seconds)...');
    this.intervalId = setInterval(() => this.checkExpiredTimers(), 10000);
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.logger.log('Stopped Timer Scheduler polling.');
    }
  }

  async checkExpiredTimers() {
    try {
      const activeBots = Array.from(BotManagerService.activeBotsMap.keys());
      if (activeBots.length === 0) return;

      const now = Date.now();

      for (const botId of activeBots) {
        const timersRef = this.firebaseService.db
          .collection('bots')
          .doc(botId)
          .collection('timers');

        // Query expired timers
        const expiredSnapshot = await timersRef
          .where('executeAt', '<=', now)
          .get();

        if (expiredSnapshot.empty) continue;

        this.logger.log(`Found ${expiredSnapshot.size} expired timers for bot ${botId}`);

        const botInstance = BotManagerService.activeBotsMap.get(botId);
        if (!botInstance) continue;

        for (const doc of expiredSnapshot.docs) {
          const timer = doc.data();
          const timerDocId = doc.id;

          try {
            // Fetch contact details
            const contactSnap = await this.firebaseService.db
              .collection('bots')
              .doc(botId)
              .collection('contacts')
              .doc(timer.contactId)
              .get();

            if (contactSnap.exists) {
              const contact = contactSnap.data() as any;
              
              // Build mock ctx mimicking incoming event methods used in executeNodeAction
              const mockCtx = {
                reply: async (text: string, extra?: any) => {
                  return botInstance.telegram.sendMessage(contact.telegramId, text, extra);
                },
                replyWithPhoto: async (photo: string, extra?: any) => {
                  return botInstance.telegram.sendPhoto(contact.telegramId, photo, extra);
                },
                replyWithVideo: async (video: string, extra?: any) => {
                  return botInstance.telegram.sendVideo(contact.telegramId, video, extra);
                }
              };

              // Resume the workflow at the next node
              if (timer.nextNodeId) {
                await this.workflowService.resumeWorkflow(botId, timer.contactId, timer.nextNodeId, mockCtx);
              } else {
                // If there's no next node, clear state waitingFor
                const state = contact.state ? JSON.parse(contact.state) : { variables: {}, waitingFor: null };
                state.waitingFor = null;
                await this.firebaseService.updateContactState(botId, timer.contactId, JSON.stringify(state));
              }
            }

            // Delete the timer document
            await timersRef.doc(timerDocId).delete();
            this.logger.log(`Processed and deleted timer ${timerDocId} for contact ${timer.contactId}`);

          } catch (err: any) {
            this.logger.error(`Error processing timer ${timerDocId}: ${err.message}`);
            // Delete failed timer to prevent stuck cron loops
            await timersRef.doc(timerDocId).delete().catch(() => {});
          }
        }
      }
    } catch (e: any) {
      this.logger.error(`Error in checkExpiredTimers loop: ${e.message}`);
    }
  }
}
