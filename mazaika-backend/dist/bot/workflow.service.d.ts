import { PrismaService } from '../prisma/prisma.service';
export declare class WorkflowService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    processIncomingMessage(botId: string, telegramId: string, text: string, ctx: any): Promise<void>;
    private getNextNode;
    private executeNodeAction;
}
