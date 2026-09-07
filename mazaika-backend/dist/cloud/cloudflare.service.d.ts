export interface CloudflareDeployResult {
    success: boolean;
    url: string;
    isEdge: boolean;
    provider: 'cloudflare' | 'mazaika-edge';
    slug: string;
    message?: string;
    deployedAt: string;
}
export declare class CloudflareService {
    private readonly logger;
    private readonly accountId;
    private readonly apiToken;
    deployUserSite(slug: string, htmlContent: string, files?: Record<string, string>, domainHost?: string): Promise<CloudflareDeployResult>;
}
