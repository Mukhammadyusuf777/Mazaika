import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowService } from './workflow.service';
export declare class BotManagerService implements OnModuleInit {
    private prisma;
    private workflowService;
    private readonly logger;
    private activeBots;
    constructor(prisma: PrismaService, workflowService: WorkflowService);
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
    getBotStatus(botId: string): {
        isRunning: boolean;
    };
    sendMessageToUser(botId: string, telegramId: string, text: string): Promise<boolean>;
}
