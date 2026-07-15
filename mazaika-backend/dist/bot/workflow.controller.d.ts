import { FirebaseService } from '../firebase/firebase.service';
export declare class WorkflowController {
    private firebaseService;
    constructor(firebaseService: FirebaseService);
    getWorkflow(botId: string): Promise<{
        nodes: never[];
        edges: never[];
        name: string;
        botId: string;
        isMain: boolean;
    } | {
        nodes: any;
        edges: any;
    }>;
    updateWorkflow(botId: string, body: {
        nodes: any[];
        edges: any[];
    }): Promise<{
        nodes: any[];
        edges: any[];
    }>;
}
