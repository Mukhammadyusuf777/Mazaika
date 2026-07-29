import { FirebaseService } from '../firebase/firebase.service';
import { MazaikaEngineService } from '../cloud/mazaika-engine.service';
export declare class WorkflowService {
    private firebaseService;
    private mazaikaEngineService;
    private readonly logger;
    constructor(firebaseService: FirebaseService, mazaikaEngineService: MazaikaEngineService);
    processIncomingMessage(botId: string, telegramId: string, text: string, ctx: any): Promise<void>;
    resumeWorkflow(botId: string, contactId: string, nextNodeId: string, ctx: any): Promise<void>;
    private getNextNode;
    private executeNodeAction;
}
