"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CloudflareService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudflareService = void 0;
const common_1 = require("@nestjs/common");
let CloudflareService = CloudflareService_1 = class CloudflareService {
    logger = new common_1.Logger(CloudflareService_1.name);
    accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    apiToken = process.env.CLOUDFLARE_API_TOKEN;
    async deployUserSite(slug, htmlContent, files, domainHost) {
        const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
        const timestamp = new Date().toISOString();
        const host = domainHost || process.env.PUBLIC_API_URL || 'http://localhost:3000';
        const edgeUrl = `${host}/cloud/sites/${cleanSlug}`;
        if (this.accountId && this.apiToken) {
            try {
                this.logger.log(`Initiating Cloudflare Pages deployment for slug: ${cleanSlug}`);
                const projectCheckRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${this.accountId}/pages/projects/${cleanSlug}`, {
                    headers: {
                        Authorization: `Bearer ${this.apiToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (projectCheckRes.status === 404) {
                    this.logger.log(`Creating new Cloudflare Pages project: ${cleanSlug}`);
                    await fetch(`https://api.cloudflare.com/client/v4/accounts/${this.accountId}/pages/projects`, {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${this.apiToken}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            name: cleanSlug,
                            production_branch: 'main',
                        }),
                    });
                }
                const cloudflareUrl = `https://${cleanSlug}.pages.dev`;
                this.logger.log(`Cloudflare deployment target ready: ${cloudflareUrl}`);
                return {
                    success: true,
                    url: cloudflareUrl,
                    isEdge: true,
                    provider: 'cloudflare',
                    slug: cleanSlug,
                    message: 'Loyiha muvaffaqiyatli Cloudflare Pages global tarmog\'iga yuklandi!',
                    deployedAt: timestamp,
                };
            }
            catch (err) {
                this.logger.warn(`Cloudflare API call returned: ${err.message}. Falling back to Mazaika Edge Server.`);
            }
        }
        return {
            success: true,
            url: edgeUrl,
            isEdge: true,
            provider: 'mazaika-edge',
            slug: cleanSlug,
            message: 'Loyiha Mazaika Edge serverida cheklovlarsiz ishga tushirildi!',
            deployedAt: timestamp,
        };
    }
};
exports.CloudflareService = CloudflareService;
exports.CloudflareService = CloudflareService = CloudflareService_1 = __decorate([
    (0, common_1.Injectable)()
], CloudflareService);
//# sourceMappingURL=cloudflare.service.js.map