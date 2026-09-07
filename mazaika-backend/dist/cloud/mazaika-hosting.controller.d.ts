import { MazaikaDbService } from './mazaika-db.service';
import { CloudflareService } from './cloudflare.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class MazaikaHostingController {
    private readonly db;
    private readonly cloudflare;
    private readonly prisma;
    constructor(db: MazaikaDbService, cloudflare: CloudflareService, prisma: PrismaService);
    renderSite(identifier: string, req: any, res: any): Promise<void>;
    publishToCloudflare(identifier: string, body: {
        html?: string;
        slug?: string;
    }, req: any): Promise<import("./cloudflare.service").CloudflareDeployResult>;
}
