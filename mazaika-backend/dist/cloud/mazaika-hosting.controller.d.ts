import { MazaikaDbService } from './mazaika-db.service';
export declare class MazaikaHostingController {
    private readonly db;
    constructor(db: MazaikaDbService);
    renderSite(slug: string): Promise<any>;
}
