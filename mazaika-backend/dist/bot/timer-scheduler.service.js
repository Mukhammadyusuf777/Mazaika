"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TimerSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimerSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../firebase/firebase.service");
const workflow_service_1 = require("./workflow.service");
const bot_manager_service_1 = require("./bot-manager.service");
let TimerSchedulerService = TimerSchedulerService_1 = class TimerSchedulerService {
    firebaseService;
    workflowService;
    logger = new common_1.Logger(TimerSchedulerService_1.name);
    intervalId = null;
    constructor(firebaseService, workflowService) {
        this.firebaseService = firebaseService;
        this.workflowService = workflowService;
    }
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
            const activeBots = Array.from(bot_manager_service_1.BotManagerService.activeBotsMap.keys());
            if (activeBots.length === 0)
                return;
            const now = Date.now();
            for (const botId of activeBots) {
                const timersRef = this.firebaseService.db
                    .collection('bots')
                    .doc(botId)
                    .collection('timers');
                const expiredSnapshot = await timersRef
                    .where('executeAt', '<=', now)
                    .get();
                if (expiredSnapshot.empty)
                    continue;
                this.logger.log(`Found ${expiredSnapshot.size} expired timers for bot ${botId}`);
                const botInstance = bot_manager_service_1.BotManagerService.activeBotsMap.get(botId);
                if (!botInstance)
                    continue;
                for (const doc of expiredSnapshot.docs) {
                    const timer = doc.data();
                    const timerDocId = doc.id;
                    try {
                        const contactSnap = await this.firebaseService.db
                            .collection('bots')
                            .doc(botId)
                            .collection('contacts')
                            .doc(timer.contactId)
                            .get();
                        if (contactSnap.exists) {
                            const contact = contactSnap.data();
                            const mockCtx = {
                                reply: async (text, extra) => {
                                    return botInstance.telegram.sendMessage(contact.telegramId, text, extra);
                                },
                                replyWithPhoto: async (photo, extra) => {
                                    return botInstance.telegram.sendPhoto(contact.telegramId, photo, extra);
                                },
                                replyWithVideo: async (video, extra) => {
                                    return botInstance.telegram.sendVideo(contact.telegramId, video, extra);
                                }
                            };
                            if (timer.nextNodeId) {
                                await this.workflowService.resumeWorkflow(botId, timer.contactId, timer.nextNodeId, mockCtx);
                            }
                            else {
                                const state = contact.state ? JSON.parse(contact.state) : { variables: {}, waitingFor: null };
                                state.waitingFor = null;
                                await this.firebaseService.updateContactState(botId, timer.contactId, JSON.stringify(state));
                            }
                        }
                        await timersRef.doc(timerDocId).delete();
                        this.logger.log(`Processed and deleted timer ${timerDocId} for contact ${timer.contactId}`);
                    }
                    catch (err) {
                        this.logger.error(`Error processing timer ${timerDocId}: ${err.message}`);
                        await timersRef.doc(timerDocId).delete().catch(() => { });
                    }
                }
            }
        }
        catch (e) {
            this.logger.error(`Error in checkExpiredTimers loop: ${e.message}`);
        }
    }
};
exports.TimerSchedulerService = TimerSchedulerService;
exports.TimerSchedulerService = TimerSchedulerService = TimerSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService,
        workflow_service_1.WorkflowService])
], TimerSchedulerService);
//# sourceMappingURL=timer-scheduler.service.js.map