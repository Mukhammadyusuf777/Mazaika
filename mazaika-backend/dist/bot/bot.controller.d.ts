import { BotManagerService } from './bot-manager.service';
import { FirebaseService } from '../firebase/firebase.service';
export declare class BotController {
    private readonly botManager;
    private firebaseService;
    constructor(botManager: BotManagerService, firebaseService: FirebaseService);
    getBot(id: string): Promise<any>;
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
        error: string;
        success?: undefined;
    } | {
        success: boolean;
        error?: undefined;
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
