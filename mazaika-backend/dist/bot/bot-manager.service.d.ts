import { OnModuleInit } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { WorkflowService } from './workflow.service';
export declare class BotManagerService implements OnModuleInit {
    private firebaseService;
    private workflowService;
    private readonly logger;
    private activeBots;
    constructor(firebaseService: FirebaseService, workflowService: WorkflowService);
    onModuleInit(): Promise<void>;
    startBot(botId: string, token: string): Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: any;
    }>;
    stopBot(botId: string): Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
    setMenuButton(botId: string, text: string, url: string): Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: any;
    }>;
    resetMenuButton(botId: string): Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: any;
    }>;
    getBotStatus(botId: string): {
        isRunning: boolean;
    };
    sendMessageToUser(botId: string, telegramId: string, text: string): Promise<boolean>;
}
