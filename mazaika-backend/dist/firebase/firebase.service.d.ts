import { Firestore } from 'firebase-admin/firestore';
export declare class FirebaseService {
    private readonly logger;
    private dbInstance;
    constructor();
    private initFirebase;
    get db(): Firestore;
    getActiveBots(): Promise<any[]>;
    getBot(botId: string): Promise<any>;
    updateBotStatus(botId: string, status: string): Promise<void>;
    getBotWorkflow(botId: string): Promise<any>;
    getContact(botId: string, telegramId: string): Promise<any>;
    createContact(botId: string, data: any): Promise<any>;
    updateContactState(botId: string, contactId: string, state: string): Promise<void>;
    addMessage(botId: string, contactId: string, text: string, direction: 'inbound' | 'outbound'): Promise<void>;
}
