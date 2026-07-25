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
const firebase_service_1 = require("../firebase/firebase.service");
let BotController = class BotController {
    botManager;
    firebaseService;
    constructor(botManager, firebaseService) {
        this.botManager = botManager;
        this.firebaseService = firebaseService;
    }
    async getBot(id) {
        const bot = await this.firebaseService.getBot(id);
        if (bot) {
            const status = this.botManager.getBotStatus(id);
            return { ...bot, isRunning: status.isRunning };
        }
        return null;
    }
    async startBot(id) {
        const bot = await this.firebaseService.getBot(id);
        if (!bot)
            return { error: 'Bot not found' };
        if (!bot.token)
            return { error: 'Bot token is empty' };
        if (bot.token === 'TEST_TOKEN')
            return { error: 'Bot token is empty' };
        return this.botManager.startBot(bot.id, bot.token);
    }
    async stopBot(id) {
        return this.botManager.stopBot(id);
    }
    async sendMessage(botId, contactId, data) {
        const snap = await this.firebaseService.db.collection('bots').doc(botId).collection('contacts').doc(contactId).get();
        if (!snap.exists)
            return { error: 'Contact not found' };
        const contact = snap.data();
        if (!contact)
            return { error: 'Contact not found' };
        const success = await this.botManager.sendMessageToUser(botId, contact.telegramId, data.text);
        if (!success)
            return { error: 'Failed to send message (bot might be offline)' };
        await this.firebaseService.addMessage(botId, contactId, data.text, 'outbound');
        return { success: true };
    }
    async broadcast(botId, data) {
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
    async getAnalytics(botId) {
        const db = this.firebaseService.db;
        const contactsSnap = await db.collection('bots').doc(botId).collection('contacts').get();
        const totalContacts = contactsSnap.size;
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
        let todayMessages = 0;
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
                    if (dateStr === todayStr) {
                        todayMessages += 1;
                    }
                    if (chartDataMap.has(dateStr)) {
                        chartDataMap.get(dateStr).msgs += 1;
                    }
                }
            }
        }
        const chartData = Array.from(chartDataMap.values()).map(({ name, users, msgs }) => ({ name, users, msgs }));
        return {
            totalContacts,
            todayMessages,
            chartData
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
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BotController.prototype, "getBot", null);
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
        firebase_service_1.FirebaseService])
], BotController);
//# sourceMappingURL=bot.controller.js.map