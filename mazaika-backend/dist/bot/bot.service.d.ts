import { PrismaService } from '../prisma/prisma.service';
export declare class BotService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserBots(userId: string): Promise<({
        site: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            botId: string | null;
            slug: string;
            appName: string;
            theme: string;
            themeColor: string;
            sourceCode: string;
            files: string;
            blocks: string | null;
            isPublished: boolean;
            cloudflareUrl: string | null;
            views: number;
        } | null;
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
        createdAt: Date;
        updatedAt: Date;
        status: string;
        token: string | null;
        projectType: string;
        userId: string;
    })[]>;
    getBotById(id: string): Promise<({
        site: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            botId: string | null;
            slug: string;
            appName: string;
            theme: string;
            themeColor: string;
            sourceCode: string;
            files: string;
            blocks: string | null;
            isPublished: boolean;
            cloudflareUrl: string | null;
            views: number;
        } | null;
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
        createdAt: Date;
        updatedAt: Date;
        status: string;
        token: string | null;
        projectType: string;
        userId: string;
    }) | null>;
    createBot(data: {
        name: string;
        token?: string;
        userId: string;
        template?: string;
        projectType?: string;
        customNodes?: any[];
        customEdges?: any[];
    }): Promise<{
        site: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            botId: string | null;
            slug: string;
            appName: string;
            theme: string;
            themeColor: string;
            sourceCode: string;
            files: string;
            blocks: string | null;
            isPublished: boolean;
            cloudflareUrl: string | null;
            views: number;
        } | null;
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
        createdAt: Date;
        updatedAt: Date;
        status: string;
        token: string | null;
        projectType: string;
        userId: string;
    }>;
    deleteBot(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        token: string | null;
        projectType: string;
        userId: string;
    }>;
    updateBot(id: string, data: {
        name?: string;
        token?: string;
        status?: string;
        projectType?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        token: string | null;
        projectType: string;
        userId: string;
    }>;
    getWebhooks(botId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        method: string;
        url: string;
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
        active: boolean;
        method: string;
        url: string;
        botId: string;
    }>;
    deleteWebhook(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        method: string;
        url: string;
        botId: string;
    }>;
}
