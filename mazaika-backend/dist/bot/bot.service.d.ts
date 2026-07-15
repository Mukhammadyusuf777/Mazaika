import { PrismaService } from '../prisma/prisma.service';
export declare class BotService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserBots(userId: string): Promise<{
        id: string;
        name: string;
        token: string;
        status: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getBotById(id: string): Promise<({
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
    } & {
        id: string;
        name: string;
        token: string;
        status: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
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
    deleteWebhook(id: string): Promise<{
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
