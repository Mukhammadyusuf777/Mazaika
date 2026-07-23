import { PrismaService } from '../prisma/prisma.service';
export declare class BotService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserBots(userId: string): Promise<{
        status: string;
        updatedAt: Date;
        createdAt: Date;
        id: string;
        name: string;
        token: string;
        userId: string;
    }[]>;
    getBotById(id: string): Promise<({
        workflows: {
            updatedAt: Date;
            createdAt: Date;
            id: string;
            botId: string;
            nodes: string;
            edges: string;
            name: string;
            description: string | null;
            isMain: boolean;
        }[];
    } & {
        status: string;
        updatedAt: Date;
        createdAt: Date;
        id: string;
        name: string;
        token: string;
        userId: string;
    }) | null>;
    createBot(data: {
        name: string;
        token: string;
        userId: string;
        template?: string;
    }): Promise<{
        status: string;
        updatedAt: Date;
        createdAt: Date;
        id: string;
        name: string;
        token: string;
        userId: string;
    }>;
    deleteBot(id: string): Promise<{
        status: string;
        updatedAt: Date;
        createdAt: Date;
        id: string;
        name: string;
        token: string;
        userId: string;
    }>;
    updateBot(id: string, data: {
        name?: string;
        token?: string;
        status?: string;
    }): Promise<{
        status: string;
        updatedAt: Date;
        createdAt: Date;
        id: string;
        name: string;
        token: string;
        userId: string;
    }>;
    getWebhooks(botId: string): Promise<{
        active: boolean;
        updatedAt: Date;
        createdAt: Date;
        method: string;
        url: string;
        id: string;
        botId: string;
        name: string;
    }[]>;
    createWebhook(botId: string, data: {
        name: string;
        url: string;
        method?: string;
        active?: boolean;
    }): Promise<{
        active: boolean;
        updatedAt: Date;
        createdAt: Date;
        method: string;
        url: string;
        id: string;
        botId: string;
        name: string;
    }>;
    deleteWebhook(id: string): Promise<{
        active: boolean;
        updatedAt: Date;
        createdAt: Date;
        method: string;
        url: string;
        id: string;
        botId: string;
        name: string;
    }>;
}
