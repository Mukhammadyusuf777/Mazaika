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
const bot_service_1 = require("./bot.service");
const bot_manager_service_1 = require("./bot-manager.service");
const prisma_service_1 = require("../prisma/prisma.service");
let BotController = class BotController {
    botService;
    botManager;
    prisma;
    constructor(botService, botManager, prisma) {
        this.botService = botService;
        this.botManager = botManager;
        this.prisma = prisma;
    }
    async getUserBots(userId) {
        return this.botService.getUserBots(userId);
    }
    async getBot(id) {
        const bot = await this.botService.getBotById(id);
        if (bot) {
            const status = this.botManager.getBotStatus(id);
            return { ...bot, isRunning: status.isRunning };
        }
        return null;
    }
    async createBot(data) {
        return this.botService.createBot(data);
    }
    async startBot(id) {
        const bot = await this.prisma.bot.findUnique({ where: { id } });
        if (!bot)
            return { error: 'Bot not found' };
        if (!bot.token)
            return { error: 'Bot token is empty' };
        return this.botManager.startBot(bot.id, bot.token);
    }
    async stopBot(id) {
        return this.botManager.stopBot(id);
    }
    async getContacts(id) {
        return this.prisma.contact.findMany({
            where: { botId: id },
            orderBy: { updatedAt: 'desc' }
        });
    }
    async getMessages(id, contactId) {
        return this.prisma.message.findMany({
            where: { contactId },
            orderBy: { createdAt: 'asc' }
        });
    }
    async sendMessage(botId, contactId, data) {
        const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
        if (!contact)
            return { error: 'Contact not found' };
        const success = await this.botManager.sendMessageToUser(botId, contact.telegramId, data.text);
        if (!success)
            return { error: 'Failed to send message (bot might be offline)' };
        const message = await this.prisma.message.create({
            data: {
                text: data.text,
                direction: 'outbound',
                contactId: contact.id
            }
        });
        return message;
    }
    async broadcast(botId, data) {
        const contacts = await this.prisma.contact.findMany({ where: { botId } });
        let successCount = 0;
        let failCount = 0;
        for (const contact of contacts) {
            const success = await this.botManager.sendMessageToUser(botId, contact.telegramId, data.text);
            if (success) {
                successCount++;
                await this.prisma.message.create({
                    data: {
                        text: data.text,
                        direction: 'outbound',
                        contactId: contact.id
                    }
                });
            }
            else {
                failCount++;
            }
        }
        return { successCount, failCount };
    }
    async getAnalytics(botId) {
        const totalContacts = await this.prisma.contact.count({ where: { botId } });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const contacts = await this.prisma.contact.findMany({ where: { botId }, select: { id: true } });
        const contactIds = contacts.map(c => c.id);
        const todayMessages = await this.prisma.message.count({
            where: {
                contactId: { in: contactIds },
                createdAt: { gte: today }
            }
        });
        const allContacts = await this.prisma.contact.findMany({ where: { botId } });
        const allMessages = await this.prisma.message.findMany({ where: { contactId: { in: contactIds } } });
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('ru-RU', { weekday: 'short' });
            const startOfDay = new Date(d);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(d);
            endOfDay.setHours(23, 59, 59, 999);
            const dailyUsers = allContacts.filter(c => c.createdAt >= startOfDay && c.createdAt <= endOfDay).length;
            const dailyMsgs = allMessages.filter(m => m.createdAt >= startOfDay && m.createdAt <= endOfDay).length;
            chartData.push({
                name: dateStr,
                users: dailyUsers,
                msgs: dailyMsgs
            });
        }
        return {
            totalContacts,
            todayMessages,
            chartData
        };
    }
    async deleteBot(id) {
        await this.botManager.stopBot(id);
        return this.botService.deleteBot(id);
    }
    async updateBot(id, data) {
        const oldBot = await this.prisma.bot.findUnique({ where: { id } });
        const bot = await this.botService.updateBot(id, data);
        if (data.token && oldBot && oldBot.token !== data.token) {
            const status = this.botManager.getBotStatus(id);
            if (status.isRunning) {
                await this.botManager.stopBot(id);
                await this.botManager.startBot(id, data.token);
            }
        }
        return bot;
    }
    async getWebhooks(botId) {
        return this.botService.getWebhooks(botId);
    }
    async createWebhook(botId, data) {
        return this.botService.createWebhook(botId, data);
    }
    async deleteWebhook(webhookId) {
        return this.botService.deleteWebhook(webhookId);
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
    (0, common_1.Get)(':id/contacts'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BotController.prototype, "getContacts", null);
__decorate([
    (0, common_1.Get)(':id/contacts/:contactId/messages'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('contactId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BotController.prototype, "getMessages", null);
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
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BotController.prototype, "deleteBot", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BotController.prototype, "updateBot", null);
__decorate([
    (0, common_1.Get)(':id/webhooks'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BotController.prototype, "getWebhooks", null);
__decorate([
    (0, common_1.Post)(':id/webhooks'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BotController.prototype, "createWebhook", null);
__decorate([
    (0, common_1.Delete)(':id/webhooks/:webhookId'),
    __param(0, (0, common_1.Param)('webhookId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BotController.prototype, "deleteWebhook", null);
exports.BotController = BotController = __decorate([
    (0, common_1.Controller)('bots'),
    __metadata("design:paramtypes", [bot_service_1.BotService,
        bot_manager_service_1.BotManagerService,
        prisma_service_1.PrismaService])
], BotController);
//# sourceMappingURL=bot.controller.js.map