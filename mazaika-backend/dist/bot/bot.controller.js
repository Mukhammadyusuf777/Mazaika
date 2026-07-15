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
        const contactsSnap = await this.firebaseService.db.collection('bots').doc(botId).collection('contacts').get();
        const totalContacts = contactsSnap.size;
        return {
            totalContacts,
            todayMessages: totalContacts * 2,
            chartData: [
                { name: 'Dush', users: 5, msgs: 12 },
                { name: 'Sesh', users: 12, msgs: 25 },
                { name: 'Chor', users: 18, msgs: 42 },
                { name: 'Pay', users: 24, msgs: 38 },
                { name: 'Juma', users: 35, msgs: 70 },
                { name: 'Shan', users: 48, msgs: 110 },
                { name: 'Yak', users: 54, msgs: 95 },
            ]
        };
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
exports.BotController = BotController = __decorate([
    (0, common_1.Controller)('bots'),
    __metadata("design:paramtypes", [bot_manager_service_1.BotManagerService,
        firebase_service_1.FirebaseService])
], BotController);
//# sourceMappingURL=bot.controller.js.map