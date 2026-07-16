import { FirebaseService } from '../firebase/firebase.service';
export declare class WorkflowService {
    private firebaseService;
    private readonly logger;
    constructor(firebaseService: FirebaseService);
    processIncomingMessage(botId: string, telegramId: string, text: string, ctx: any): Promise<void>;
    resumeWorkflow(botId: string, contactId: string, nextNodeId: string, ctx: any): Promise<void>;
    private getNextNode;
    private executeNodeAction;
}
