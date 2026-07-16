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
var BotManagerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotManagerService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../firebase/firebase.service");
const workflow_service_1 = require("./workflow.service");
const telegraf_1 = require("telegraf");
let BotManagerService = class BotManagerService {
    static { BotManagerService_1 = this; }
    firebaseService;
    workflowService;
    logger = new common_1.Logger(BotManagerService_1.name);
    static activeBotsMap = new Map();
    activeBots = new Map();
    constructor(firebaseService, workflowService) {
        this.firebaseService = firebaseService;
        this.workflowService = workflowService;
    }
    async onModuleInit() {
        this.logger.log('Initializing Bot Manager...');
        const bots = await this.firebaseService.getActiveBots();
        for (const bot of bots) {
            if (bot.token) {
                await this.startBot(bot.id, bot.token);
            }
        }
    }
    async startBot(botId, token) {
        if (this.activeBots.has(botId)) {
            this.logger.warn(`Bot ${botId} is already running.`);
            return { success: false, message: 'Already running' };
        }
        try {
            const telegrafBot = new telegraf_1.Telegraf(token);
            await telegrafBot.telegram.getMe();
            telegrafBot.on('message', async (ctx) => {
                const telegramId = ctx.from.id.toString();
                if (ctx.message && 'text' in ctx.message) {
                    await this.workflowService.processIncomingMessage(botId, telegramId, ctx.message.text, ctx);
                }
                else if (ctx.message && 'contact' in ctx.message && ctx.message.contact) {
                    const phone = ctx.message.contact.phone_number;
                    await this.workflowService.processIncomingMessage(botId, telegramId, `contact:${phone}`, ctx);
                }
                else if (ctx.message && 'location' in ctx.message && ctx.message.location) {
                    const { latitude, longitude } = ctx.message.location;
                    await this.workflowService.processIncomingMessage(botId, telegramId, `location:${latitude},${longitude}`, ctx);
                }
                else if (ctx.message && 'web_app_data' in ctx.message && ctx.message.web_app_data) {
                    const data = ctx.message.web_app_data.data;
                    await this.workflowService.processIncomingMessage(botId, telegramId, `webapp:${data}`, ctx);
                }
                else if (ctx.message && 'successful_payment' in ctx.message && ctx.message.successful_payment) {
                    const payload = ctx.message.successful_payment.invoice_payload;
                    const amount = ctx.message.successful_payment.total_amount / 100;
                    await this.workflowService.processIncomingMessage(botId, telegramId, `payment_success:${payload}:${amount}`, ctx);
                }
            });
            telegrafBot.on('pre_checkout_query', async (ctx) => {
                await ctx.answerPreCheckoutQuery(true).catch((err) => {
                    this.logger.error(`Pre-checkout query failed for bot ${botId}: ${err.message}`);
                });
            });
            telegrafBot.on('callback_query', async (ctx) => {
                if ('data' in ctx.callbackQuery) {
                    const data = ctx.callbackQuery.data;
                    const telegramId = ctx.from.id.toString();
                    await ctx.answerCbQuery().catch(() => { });
                    await this.workflowService.processIncomingMessage(botId, telegramId, data, ctx);
                }
            });
            telegrafBot.launch().catch(async (error) => {
                this.logger.error(`Bot ${botId} crashed during polling: ${error.message}`);
                this.activeBots.delete(botId);
                BotManagerService_1.activeBotsMap.delete(botId);
                await this.firebaseService.updateBotStatus(botId, 'error');
            });
            this.activeBots.set(botId, telegrafBot);
            BotManagerService_1.activeBotsMap.set(botId, telegrafBot);
            this.logger.log(`Bot ${botId} started successfully.`);
            try {
                const botDoc = await this.firebaseService.getBot(botId);
                if (botDoc && botDoc.menuButtonEnabled) {
                    await telegrafBot.telegram.setChatMenuButton({
                        menuButton: {
                            type: 'web_app',
                            text: botDoc.menuButtonText || 'Open App',
                            web_app: { url: botDoc.menuButtonUrl || `https://mazaika.pages.dev/site/${botId}` }
                        }
                    });
                    this.logger.log(`Auto-set Web App menu button for bot ${botId}`);
                }
            }
            catch (err) {
                this.logger.error(`Failed to auto-set menu button on startup for bot ${botId}: ${err.message}`);
            }
            await this.firebaseService.updateBotStatus(botId, 'active');
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to start bot ${botId}: ${error.message}`);
            await this.firebaseService.updateBotStatus(botId, 'error');
            return { success: false, message: error.message };
        }
    }
    async stopBot(botId) {
        const telegrafBot = this.activeBots.get(botId);
        if (telegrafBot) {
            telegrafBot.stop('API request');
            this.activeBots.delete(botId);
            BotManagerService_1.activeBotsMap.delete(botId);
            this.logger.log(`Bot ${botId} stopped.`);
            await this.firebaseService.updateBotStatus(botId, 'paused');
            return { success: true };
        }
        return { success: false, message: 'Bot not running' };
    }
    async setMenuButton(botId, text, url) {
        const telegrafBot = this.activeBots.get(botId);
        if (!telegrafBot)
            return { success: false, message: 'Bot not running' };
        try {
            await telegrafBot.telegram.setChatMenuButton({
                menuButton: {
                    type: 'web_app',
                    text,
                    web_app: { url }
                }
            });
            return { success: true };
        }
        catch (e) {
            this.logger.error(`Failed to set menu button for bot ${botId}: ${e.message}`);
            return { success: false, message: e.message };
        }
    }
    async resetMenuButton(botId) {
        const telegrafBot = this.activeBots.get(botId);
        if (!telegrafBot)
            return { success: false, message: 'Bot not running' };
        try {
            await telegrafBot.telegram.setChatMenuButton({
                menuButton: {
                    type: 'default'
                }
            });
            return { success: true };
        }
        catch (e) {
            this.logger.error(`Failed to reset menu button for bot ${botId}: ${e.message}`);
            return { success: false, message: e.message };
        }
    }
    getBotStatus(botId) {
        return { isRunning: this.activeBots.has(botId) };
    }
    async sendMessageToUser(botId, telegramId, text) {
        const telegrafBot = this.activeBots.get(botId);
        if (!telegrafBot)
            return false;
        try {
            await telegrafBot.telegram.sendMessage(telegramId, text);
            return true;
        }
        catch (e) {
            this.logger.error(`Failed to send message from bot ${botId} to ${telegramId}: ${e.message}`);
            return false;
        }
    }
};
exports.BotManagerService = BotManagerService;
exports.BotManagerService = BotManagerService = BotManagerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService,
        workflow_service_1.WorkflowService])
], BotManagerService);
//# sourceMappingURL=bot-manager.service.js.map