import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class MazaikaDbService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private readonly dbFilePath;
    private storage;
    private saveInterval;
    onModuleInit(): void;
    onModuleDestroy(): void;
    private loadFromFile;
    private saveToFile;
    save(appId: string, collection: string, data: any, customKey?: string): Promise<{
        success: boolean;
        key: string;
        data: any;
    }>;
    find(appId: string, collection: string): Promise<any[]>;
    findOne(key: string): Promise<any>;
}
