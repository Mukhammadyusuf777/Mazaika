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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BotService = class BotService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserBots(userId) {
        return this.prisma.bot.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getBotById(id) {
        return this.prisma.bot.findUnique({
            where: { id },
            include: { workflows: true },
        });
    }
    async createBot(data) {
        let nodes = '[]';
        let edges = '[]';
        if (data.template === 'Internet do\'kon') {
            nodes = JSON.stringify([
                { id: 'node-1', type: 'start', position: { x: 100, y: 200 }, data: { label: 'Boshlash', emoji: '▶', color: '#10d974' } },
                { id: 'node-2', type: 'message', position: { x: 300, y: 200 }, data: { label: 'Salomlashish', emoji: '💬', color: '#1e90ff', text: 'Xush kelibsiz! Internet do\'konda mahsulotlarni sotib olishingiz mumkin.', buttons: ['Katalog', 'Savatcha', 'Aloqa'] } },
                { id: 'node-3', type: 'cart', position: { x: 580, y: 100 }, data: { label: 'Savatga VIP qo\'shish', emoji: '🛒', color: '#ec4899', cartAction: 'add', itemName: 'VIP Kurs' } },
                { id: 'node-4', type: 'message', position: { x: 820, y: 100 }, data: { label: 'Xabar (VIP)', emoji: '💬', color: '#1e90ff', text: 'VIP Kurs savatga muvaffaqiyatli qo\'shildi!', buttons: ['To\'lov qilish'] } },
                { id: 'node-5', type: 'orderList', position: { x: 580, y: 250 }, data: { label: 'Buyurtmalar ro\'yxati', emoji: '📦', color: '#8b5cf6' } },
                { id: 'node-6', type: 'message', position: { x: 820, y: 250 }, data: { label: 'Xabar (Buyurtma)', emoji: '💬', color: '#1e90ff', text: 'Yuqorida buyurtmalaringiz ro\'yxati.', buttons: ['To\'lov qilish'] } },
                { id: 'node-7', type: 'message', position: { x: 580, y: 400 }, data: { label: 'Xabar (Aloqa)', emoji: '💬', color: '#1e90ff', text: 'Biz bilan bog\'lanish uchun: @MazaikaSupportBot' } },
                { id: 'node-8', type: 'payme', position: { x: 1100, y: 180 }, data: { label: 'Payme Invoys', emoji: '💳', color: '#10d974', title: 'Buyurtma uchun to\'lov', price: 99000, providerToken: 'TEST_PROVIDER_TOKEN' } }
            ]);
            edges = JSON.stringify([
                { id: 'e1', source: 'node-1', target: 'node-2', type: 'buttonEdge', animated: true, style: { stroke: '#1e90ff', strokeWidth: 2, opacity: 0.7 } },
                { id: 'e2', source: 'node-2', sourceHandle: 'btn_0', target: 'node-3', type: 'buttonEdge', animated: true, style: { stroke: '#1e90ff', strokeWidth: 2, opacity: 0.7 } },
                { id: 'e3', source: 'node-3', target: 'node-4', type: 'buttonEdge', animated: true, style: { stroke: '#1e90ff', strokeWidth: 2, opacity: 0.7 } },
                { id: 'e4', source: 'node-2', sourceHandle: 'btn_1', target: 'node-5', type: 'buttonEdge', animated: true, style: { stroke: '#1e90ff', strokeWidth: 2, opacity: 0.7 } },
                { id: 'e5', source: 'node-5', target: 'node-6', type: 'buttonEdge', animated: true, style: { stroke: '#1e90ff', strokeWidth: 2, opacity: 0.7 } },
                { id: 'e6', source: 'node-2', sourceHandle: 'btn_2', target: 'node-7', type: 'buttonEdge', animated: true, style: { stroke: '#1e90ff', strokeWidth: 2, opacity: 0.7 } },
                { id: 'e7', source: 'node-4', sourceHandle: 'btn_0', target: 'node-8', type: 'buttonEdge', animated: true, style: { stroke: '#1e90ff', strokeWidth: 2, opacity: 0.7 } },
                { id: 'e8', source: 'node-6', sourceHandle: 'btn_0', target: 'node-8', type: 'buttonEdge', animated: true, style: { stroke: '#1e90ff', strokeWidth: 2, opacity: 0.7 } }
            ]);
        }
        else if (data.template === 'Yetkazib berish') {
            nodes = JSON.stringify([
                { id: 'node-1', type: 'start', position: { x: 100, y: 200 }, data: { label: 'Boshlash', emoji: '▶', color: '#10d974' } },
                { id: 'node-2', type: 'message', position: { x: 300, y: 200 }, data: { label: 'Salomlashish', emoji: '💬', color: '#1e90ff', text: 'Kuryerlik xizmatiga xush kelibsiz!', buttons: ['Buyurtma berish', 'Statusni tekshirish'] } },
                { id: 'node-3', type: 'phone', position: { x: 580, y: 100 }, data: { label: 'Telefon raqam', emoji: '📱', color: '#a855f7', text: 'Iltimos, telefon raqamingizni yuboring:', variable: 'phone' } },
                { id: 'node-4', type: 'location', position: { x: 820, y: 100 }, data: { label: 'Lokatsiya', emoji: '📍', color: '#a855f7', text: 'Yetkazib berish manzilini ulashing:', variable: 'loc' } },
                { id: 'node-5', type: 'message', position: { x: 1060, y: 100 }, data: { label: 'Xabar (Qabul)', emoji: '💬', color: '#1e90ff', text: 'Rahmat! Kuryer tez orada yo\'lga chiqadi.' } },
                { id: 'node-6', type: 'message', position: { x: 580, y: 300 }, data: { label: 'Xabar (Status)', emoji: '💬', color: '#1e90ff', text: 'Kuryer hozirda ombordan yukingizni olib chiqdi.' } }
            ]);
            edges = JSON.stringify([
                { id: 'e1', source: 'node-1', target: 'node-2', type: 'buttonEdge', animated: true },
                { id: 'e2', source: 'node-2', sourceHandle: 'btn_0', target: 'node-3', type: 'buttonEdge', animated: true },
                { id: 'e3', source: 'node-3', target: 'node-4', type: 'buttonEdge', animated: true },
                { id: 'e4', source: 'node-4', target: 'node-5', type: 'buttonEdge', animated: true },
                { id: 'e5', source: 'node-2', sourceHandle: 'btn_1', target: 'node-6', type: 'buttonEdge', animated: true }
            ]);
        }
        else if (data.template === 'Restoran') {
            nodes = JSON.stringify([
                { id: 'node-1', type: 'start', position: { x: 100, y: 200 }, data: { label: 'Boshlash', emoji: '▶', color: '#10d974' } },
                { id: 'node-2', type: 'message', position: { x: 300, y: 200 }, data: { label: 'Xabar', emoji: '💬', color: '#1e90ff', text: 'Restoranimizga xush kelibsiz! Stol bron qilishni xohlaysizmi?', buttons: ['Stol bron qilish', 'Menyu'] } },
                { id: 'node-3', type: 'question', position: { x: 580, y: 100 }, data: { label: 'Ism so\'rash', emoji: '❓', color: '#a855f7', text: 'Iltimos, ismingizni yozib yuboring:', variable: 'client_name' } },
                { id: 'node-4', type: 'phone', position: { x: 820, y: 100 }, data: { label: 'Telefon so\'rash', emoji: '📱', color: '#a855f7', text: 'Aloqa uchun telefon raqam:', variable: 'client_phone' } },
                { id: 'node-5', type: 'message', position: { x: 1060, y: 100 }, data: { label: 'Tasdiqlash', emoji: '💬', color: '#1e90ff', text: 'Rahmat, {client_name}! Stol muvaffaqiyatli bron qilindi. Telefoningiz: {client_phone}' } },
                { id: 'node-6', type: 'message', position: { x: 580, y: 300 }, data: { label: 'Menyu', emoji: '💬', color: '#1e90ff', text: 'Bugungi menyu:\n1. Pitsa - 45 000 UZS\n2. Burger - 25 000 UZS\n3. Limonad - 12 000 UZS' } }
            ]);
            edges = JSON.stringify([
                { id: 'e1', source: 'node-1', target: 'node-2', type: 'buttonEdge', animated: true },
                { id: 'e2', source: 'node-2', sourceHandle: 'btn_0', target: 'node-3', type: 'buttonEdge', animated: true },
                { id: 'e3', source: 'node-3', target: 'node-4', type: 'buttonEdge', animated: true },
                { id: 'e4', source: 'node-4', target: 'node-5', type: 'buttonEdge', animated: true },
                { id: 'e5', source: 'node-2', sourceHandle: 'btn_1', target: 'node-6', type: 'buttonEdge', animated: true }
            ]);
        }
        else if (data.template === 'Kurs savdo') {
            nodes = JSON.stringify([
                { id: 'node-1', type: 'start', position: { x: 100, y: 200 }, data: { label: 'Boshlash', emoji: '▶', color: '#10d974' } },
                { id: 'node-2', type: 'message', position: { x: 300, y: 200 }, data: { label: 'Kurslar', emoji: '💬', color: '#1e90ff', text: 'Dasturlash kurslarimizga ro\'yxatdan o\'ting!', buttons: ['Python Kursi', 'VIP Statusini tekshirish'] } },
                { id: 'node-3', type: 'click', position: { x: 580, y: 100 }, data: { label: 'Click Invoys', emoji: '💳', color: '#00aaff', title: 'Python Kursi', price: 150000, providerToken: 'TEST_PROVIDER_TOKEN' } },
                { id: 'node-4', type: 'condition', position: { x: 580, y: 300 }, data: { label: 'Teg tekshirish', emoji: '🔀', color: '#ffb830', variable: 'tags', operator: 'contains', value: 'VIP' } },
                { id: 'node-5', type: 'message', position: { x: 850, y: 250 }, data: { label: 'VIP Xabar', emoji: '💬', color: '#1e90ff', text: 'Siz VIP a\'zosisiz!' } },
                { id: 'node-6', type: 'message', position: { x: 850, y: 380 }, data: { label: 'Oddiy Xabar', emoji: '💬', color: '#1e90ff', text: 'Kursni sotib olib, VIP statusga ega bo\'ling.' } }
            ]);
            edges = JSON.stringify([
                { id: 'e1', source: 'node-1', target: 'node-2', type: 'buttonEdge', animated: true },
                { id: 'e2', source: 'node-2', sourceHandle: 'btn_0', target: 'node-3', type: 'buttonEdge', animated: true },
                { id: 'e3', source: 'node-2', sourceHandle: 'btn_1', target: 'node-4', type: 'buttonEdge', animated: true },
                { id: 'e4', source: 'node-4', sourceHandle: 'true', target: 'node-5', type: 'buttonEdge', animated: true },
                { id: 'e5', source: 'node-4', sourceHandle: 'false', target: 'node-6', type: 'buttonEdge', animated: true }
            ]);
        }
        else if (data.template === 'Xizmatlar') {
            nodes = JSON.stringify([
                { id: 'node-1', type: 'start', position: { x: 100, y: 200 }, data: { label: 'Boshlash', emoji: '▶', color: '#10d974' } },
                { id: 'node-2', type: 'message', position: { x: 300, y: 200 }, data: { label: 'Murojaat', emoji: '💬', color: '#1e90ff', text: 'Markazimiz xizmatlari ro\'yxati. Bizga ariza yuborasizmi?', buttons: ['Ariza qoldirish', 'Xizmatlar ro\'yxati'] } },
                { id: 'node-3', type: 'question', position: { x: 580, y: 100 }, data: { label: 'Xizmat turi', emoji: '❓', color: '#a855f7', text: 'Qanday xizmat kerak? (yozing):', variable: 'service_type' } },
                { id: 'node-4', type: 'email', position: { x: 820, y: 100 }, data: { label: 'Email', emoji: '📧', color: '#a855f7', text: 'Siz bilan bog\'lanish uchun Email:', variable: 'client_email' } },
                { id: 'node-5', type: 'message', position: { x: 1060, y: 100 }, data: { label: 'Tasdiqlash', emoji: '💬', color: '#1e90ff', text: 'Rahmat! Ariza qabul qilindi. Xizmat: {service_type}, Email: {client_email}' } },
                { id: 'node-6', type: 'message', position: { x: 580, y: 300 }, data: { label: 'Narxlar', emoji: '💬', color: '#1e90ff', text: '1. Sayt yaratish - 500 000 UZS dan\n2. Logotip dizayn - 150 000 UZS' } }
            ]);
            edges = JSON.stringify([
                { id: 'e1', source: 'node-1', target: 'node-2', type: 'buttonEdge', animated: true },
                { id: 'e2', source: 'node-2', sourceHandle: 'btn_0', target: 'node-3', type: 'buttonEdge', animated: true },
                { id: 'e3', source: 'node-3', target: 'node-4', type: 'buttonEdge', animated: true },
                { id: 'e4', source: 'node-4', target: 'node-5', type: 'buttonEdge', animated: true },
                { id: 'e5', source: 'node-2', sourceHandle: 'btn_1', target: 'node-6', type: 'buttonEdge', animated: true }
            ]);
        }
        else if (data.template === 'Referral') {
            nodes = JSON.stringify([
                { id: 'node-1', type: 'start', position: { x: 100, y: 200 }, data: { label: 'Boshlash', emoji: '▶', color: '#10d974' } },
                { id: 'node-2', type: 'message', position: { x: 300, y: 200 }, data: { label: 'Referal', emoji: '💬', color: '#1e90ff', text: 'Hamkorlik dasturimizga xush kelibsiz!', buttons: ['Mening Balansim', 'Taklif qilish'] } },
                { id: 'node-3', type: 'message', position: { x: 580, y: 100 }, data: { label: 'Balans', emoji: '💬', color: '#1e90ff', text: 'Sizning virtual balansingiz: {balance} UZS' } },
                { id: 'node-4', type: 'topUpBalance', position: { x: 580, y: 250 }, data: { label: 'Balans to\'ldirish', emoji: '💰', color: '#10d974', amount: 5000 } },
                { id: 'node-5', type: 'message', position: { x: 820, y: 250 }, data: { label: 'Yutuq xabari', emoji: '💬', color: '#1e90ff', text: 'Hamkor chaqirildi! Balansingizga 5 000 UZS qo\'shildi!' } }
            ]);
            edges = JSON.stringify([
                { id: 'e1', source: 'node-1', target: 'node-2', type: 'buttonEdge', animated: true },
                { id: 'e2', source: 'node-2', sourceHandle: 'btn_0', target: 'node-3', type: 'buttonEdge', animated: true },
                { id: 'e3', source: 'node-2', sourceHandle: 'btn_1', target: 'node-4', type: 'buttonEdge', animated: true },
                { id: 'e4', source: 'node-4', target: 'node-5', type: 'buttonEdge', animated: true }
            ]);
        }
        return this.prisma.bot.create({
            data: {
                name: data.name,
                token: data.token,
                userId: data.userId,
                workflows: {
                    create: {
                        name: 'Main Flow',
                        isMain: true,
                        nodes,
                        edges,
                    }
                }
            },
        });
    }
    async deleteBot(id) {
        return this.prisma.$transaction(async (tx) => {
            const contacts = await tx.contact.findMany({
                where: { botId: id },
                select: { id: true }
            });
            const contactIds = contacts.map(c => c.id);
            await tx.message.deleteMany({
                where: { contactId: { in: contactIds } }
            });
            await tx.contact.deleteMany({
                where: { botId: id }
            });
            await tx.workflow.deleteMany({
                where: { botId: id }
            });
            return tx.bot.delete({
                where: { id }
            });
        });
    }
    async updateBot(id, data) {
        return this.prisma.bot.update({
            where: { id },
            data,
        });
    }
    async getWebhooks(botId) {
        return this.prisma.webhook.findMany({
            where: { botId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async createWebhook(botId, data) {
        return this.prisma.webhook.create({
            data: {
                botId,
                name: data.name,
                url: data.url,
                method: data.method || 'POST',
                active: data.active !== undefined ? data.active : true
            }
        });
    }
    async deleteWebhook(id) {
        return this.prisma.webhook.delete({
            where: { id }
        });
    }
};
exports.BotService = BotService;
exports.BotService = BotService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BotService);
//# sourceMappingURL=bot.service.js.map