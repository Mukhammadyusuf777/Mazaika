import { PrismaService } from '../prisma/prisma.service';
export declare class WorkflowController {
    private prisma;
    constructor(prisma: PrismaService);
    getWorkflow(botId: string): Promise<{
        nodes: any;
        edges: any;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isMain: boolean;
        botId: string;
    }>;
    updateWorkflow(botId: string, body: {
        nodes: any[];
        edges: any[];
    }): Promise<{
        error: string;
    } | {
        nodes: any;
        edges: any;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isMain: boolean;
        botId: string;
        error?: undefined;
    }>;
}
