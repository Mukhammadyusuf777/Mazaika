import { BotManagerService } from './bot-manager.service';
import { BotService } from './bot.service';
import { FirebaseService } from '../firebase/firebase.service';
export declare class BotController {
    private readonly botManager;
    private readonly botService;
    private readonly firebaseService;
    constructor(botManager: BotManagerService, botService: BotService, firebaseService: FirebaseService);
    getUserBots(userId: string): Promise<{
        isRunning: boolean;
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
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        token: string | null;
        projectType: string;
        userId: string;
    }[]>;
    getBot(id: string): Promise<any>;
    createBot(data: any): Promise<{
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
    updateBot(id: string, data: any): Promise<{
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
    sendMessage(botId: string, contactId: string, data: {
        text: string;
    }): Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
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
            name: any;
            users: any;
            msgs: any;
        }[];
    }>;
    setMenuButton(id: string, data: {
        text: string;
        url: string;
    }): Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: any;
    }>;
    resetMenuButton(id: string): Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: any;
    }>;
}
