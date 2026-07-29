import { MazaikaDbService } from './mazaika-db.service';
export declare class MazaikaEngineService {
    private readonly mazaikaDb;
    private readonly logger;
    constructor(mazaikaDb: MazaikaDbService);
    runUserScript(appId: string, code: string, payload: any): Promise<any>;
}
