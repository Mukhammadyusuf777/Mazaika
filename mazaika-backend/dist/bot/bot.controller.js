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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotController = void 0;
const common_1 = require("@nestjs/common");
const bot_manager_service_1 = require("./bot-manager.service");
const bot_service_1 = require("./bot.service");
const firebase_service_1 = require("../firebase/firebase.service");
let BotController = class BotController {
    botManager;
    botService;
    firebaseService;
    constructor(botManager, botService, firebaseService) {
        this.botManager = botManager;
        this.botService = botService;
        this.firebaseService = firebaseService;
    }
    async getUserBots(userId) {
        const bots = await this.botService.getUserBots(userId);
        return bots.map((bot) => {
            const status = this.botManager.getBotStatus(bot.id);
            return {
                ...bot,
                isRunning: status.isRunning,
            };
        });
    }
    async getBot(id) {
        const bot = await this.botService.getBotById(id);
        if (bot) {
            const status = this.botManager.getBotStatus(id);
            return { ...bot, isRunning: status.isRunning };
        }
        const fbBot = await this.firebaseService.getBot(id);
        if (fbBot) {
            const status = this.botManager.getBotStatus(id);
            return { ...fbBot, isRunning: status.isRunning };
        }
        return null;
    }
    async createBot(data) {
        return this.botService.createBot(data);
    }
    async updateBot(id, data) {
        return this.botService.updateBot(id, data);
    }
    async deleteBot(id) {
        try {
            await this.botManager.stopBot(id);
        }
        catch { }
        return this.botService.deleteBot(id);
    }
    async startBot(id) {
        let token = '';
        const bot = await this.botService.getBotById(id);
        if (bot && bot.token) {
            token = bot.token;
        }
        else {
            const fbBot = await this.firebaseService.getBot(id);
            if (fbBot && fbBot.token)
                token = fbBot.token;
        }
        if (!token || token.startsWith('TEST_TOKEN')) {
            return { error: 'Bot token kiritilmagan yoki noto\'g\'ri' };
        }
        return this.botManager.startBot(id, token);
    }
    async stopBot(id) {
        return this.botManager.stopBot(id);
    }
    async sendMessage(botId, contactId, data) {
        if (this.firebaseService.db) {
            const snap = await this.firebaseService.db.collection('bots').doc(botId).collection('contacts').doc(contactId).get();
            if (snap.exists) {
                const contact = snap.data();
                if (contact) {
                    const success = await this.botManager.sendMessageToUser(botId, contact.telegramId, data.text);
                    if (success) {
                        await this.firebaseService.addMessage(botId, contactId, data.text, 'outbound');
                        return { success: true };
                    }
                }
            }
        }
        return { success: false, message: 'Bot yoki kontakt topilmadi' };
    }
    async broadcast(botId, data) {
        if (this.firebaseService.db) {
            const snap = await this.firebaseService.db.collection('bots').doc(botId).collection('contacts').get();
            let successCount = 0;
            let failCount = 0;
            for (const doc of snap.docs) {
                const contact = doc.data();
                const success = await this.botManager.sendMessageToUser(botId, contact.telegramId, data.text);
                if (success) {
                    successCount++;
                    await this.firebaseService.addMessage(botId, doc.id, data.text, 'outbound');
                }
                else {
                    failCount++;
                }
            }
            return { successCount, failCount };
        }
        return { successCount: 0, failCount: 0 };
    }
    async getAnalytics(botId) {
        const days = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan'];
        const now = new Date();
        const chartDataMap = new Map();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = days[d.getDay()];
            chartDataMap.set(dateStr, { name: dayName, users: 0, msgs: 0 });
        }
        let totalContacts = 0;
        let todayMessages = 0;
        if (this.firebaseService.db) {
            try {
                const db = this.firebaseService.db;
                const contactsSnap = await db.collection('bots').doc(botId).collection('contacts').get();
                totalContacts = contactsSnap.size;
                const todayStr = now.toISOString().split('T')[0];
                for (const doc of contactsSnap.docs) {
                    const data = doc.data();
                    if (data.createdAt) {
                        const d = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                        const dateStr = d.toISOString().split('T')[0];
                        if (chartDataMap.has(dateStr)) {
                            chartDataMap.get(dateStr).users += 1;
                        }
                    }
                    const messagesSnap = await db.collection('bots').doc(botId).collection('contacts').doc(doc.id).collection('messages').get();
                    for (const msgDoc of messagesSnap.docs) {
                        const msg = msgDoc.data();
                        if (msg.createdAt) {
                            const d = msg.createdAt.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt);
                            const dateStr = d.toISOString().split('T')[0];
                            if (dateStr === todayStr)
                                todayMessages += 1;
                            if (chartDataMap.has(dateStr))
                                chartDataMap.get(dateStr).msgs += 1;
                        }
                    }
                }
            }
            catch { }
        }
        const chartData = Array.from(chartDataMap.values()).map(({ name, users, msgs }) => ({ name, users, msgs }));
        return {
            totalContacts,
            todayMessages,
            chartData,
        };
    }
    async setMenuButton(id, data) {
        return this.botManager.setMenuButton(id, data.text, data.url);
    }
    async resetMenuButton(id) {
        return this.botManager.resetMenuButton(id);
    }
};
exports.BotController = BotController;
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BotController.prototype, "getUserBots", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BotController.prototype, "getBot", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotController.prototype, "createBot", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BotController.prototype, "updateBot", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BotController.prototype, "deleteBot", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BotController.prototype, "startBot", null);
__decorate([
    (0, common_1.Post)(':id/stop'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BotController.prototype, "stopBot", null);
__decorate([
    (0, common_1.Post)(':id/contacts/:contactId/messages'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('contactId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], BotController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)(':id/broadcast'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BotController.prototype, "broadcast", null);
__decorate([
    (0, common_1.Get)(':id/analytics'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BotController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Post)(':id/menu-button'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BotController.prototype, "setMenuButton", null);
__decorate([
    (0, common_1.Delete)(':id/menu-button'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BotController.prototype, "resetMenuButton", null);
exports.BotController = BotController = __decorate([
    (0, common_1.Controller)('bots'),
    __metadata("design:paramtypes", [bot_manager_service_1.BotManagerService,
        bot_service_1.BotService,
        firebase_service_1.FirebaseService])
], BotController);
//# sourceMappingURL=bot.controller.js.map