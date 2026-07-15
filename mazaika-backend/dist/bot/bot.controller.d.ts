import { BotService } from './bot.service';
import { BotManagerService } from './bot-manager.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class BotController {
    private readonly botService;
    private readonly botManager;
    private prisma;
    constructor(botService: BotService, botManager: BotManagerService, prisma: PrismaService);
    getUserBots(userId: string): Promise<{
        id: string;
        name: string;
        token: string;
        status: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getBot(id: string): Promise<{
        isRunning: boolean;
        workflows: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isMain: boolean;
            nodes: string;
            edges: string;
            botId: string;
        }[];
        id: string;
        name: string;
        token: string;
        status: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    createBot(data: {
        name: string;
        token: string;
        userId: string;
        template?: string;
    }): Promise<{
        id: string;
        name: string;
        token: string;
        status: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    startBot(id: string): Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: any;
    } | {
        error: string;
    }>;
    stopBot(id: string): Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
    getContacts(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        botId: string;
        telegramId: string;
        firstName: string | null;
        lastName: string | null;
        username: string | null;
        languageCode: string | null;
        state: string | null;
    }[]>;
    getMessages(id: string, contactId: string): Promise<{
        id: string;
        createdAt: Date;
        text: string | null;
        direction: string;
        contactId: string;
    }[]>;
    sendMessage(botId: string, contactId: string, data: {
        text: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        text: string | null;
        direction: string;
        contactId: string;
    } | {
        error: string;
    }>;
    broadcast(botId: string, data: {
        text: string;
    }): Promise<{
        successCount: number;
        failCount: number;
    }>;
    getAnalytics(botId: string): Promise<{
        totalContacts: number;
        todayMessages: number;
        chartData: {
            name: string;
            users: number;
            msgs: number;
        }[];
    }>;
    deleteBot(id: string): Promise<{
        id: string;
        name: string;
        token: string;
        status: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateBot(id: string, data: {
        name?: string;
        token?: string;
        status?: string;
    }): Promise<{
        id: string;
        name: string;
        token: string;
        status: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getWebhooks(botId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        method: string;
        active: boolean;
        botId: string;
    }[]>;
    createWebhook(botId: string, data: {
        name: string;
        url: string;
        method?: string;
        active?: boolean;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        method: string;
        active: boolean;
        botId: string;
    }>;
    deleteWebhook(webhookId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        method: string;
        active: boolean;
        botId: string;
    }>;
}
