"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SiteService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteService = exports.SaveSiteDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mazaika_db_service_1 = require("../cloud/mazaika-db.service");
const cloudflare_service_1 = require("../cloud/cloudflare.service");
class SaveSiteDto {
    botId;
    userId;
    appName;
    slug;
    theme;
    themeColor;
    sourceCode;
    files;
    blocks;
}
exports.SaveSiteDto = SaveSiteDto;
let SiteService = SiteService_1 = class SiteService {
    prisma;
    mazaikaDb;
    cloudflare;
    logger = new common_1.Logger(SiteService_1.name);
    constructor(prisma, mazaikaDb, cloudflare) {
        this.prisma = prisma;
        this.mazaikaDb = mazaikaDb;
        this.cloudflare = cloudflare;
    }
    async getSiteByIdOrSlug(identifier) {
        const site = await this.prisma.site.findFirst({
            where: {
                OR: [
                    { id: identifier },
                    { slug: identifier },
                    { botId: identifier },
                ],
            },
        });
        if (!site)
            return null;
        let files = {};
        try {
            files = typeof site.files === 'string' ? JSON.parse(site.files) : site.files;
        }
        catch { }
        let blocks = [];
        try {
            blocks = site.blocks && typeof site.blocks === 'string' ? JSON.parse(site.blocks) : (site.blocks || []);
        }
        catch { }
        return {
            ...site,
            files,
            blocks,
        };
    }
    async getUserSites(userId) {
        const sites = await this.prisma.site.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });
        return sites.map(site => {
            let files = {};
            try {
                files = typeof site.files === 'string' ? JSON.parse(site.files) : site.files;
            }
            catch { }
            return { ...site, files };
        });
    }
    async saveSite(data) {
        const slug = data.slug || data.appName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30) || `site-${Date.now().toString().slice(-6)}`;
        const filesStr = typeof data.files === 'object' ? JSON.stringify(data.files) : (data.files || '{}');
        const blocksStr = typeof data.blocks === 'object' ? JSON.stringify(data.blocks) : (data.blocks || '[]');
        let existing = null;
        if (data.botId) {
            existing = await this.prisma.site.findUnique({ where: { botId: data.botId } });
        }
        if (!existing && data.slug) {
            existing = await this.prisma.site.findUnique({ where: { slug: data.slug } });
        }
        let site;
        if (existing) {
            site = await this.prisma.site.update({
                where: { id: existing.id },
                data: {
                    appName: data.appName,
                    theme: data.theme || existing.theme,
                    themeColor: data.themeColor || existing.themeColor,
                    sourceCode: data.sourceCode,
                    files: filesStr,
                    blocks: blocksStr,
                },
            });
        }
        else {
            let finalSlug = slug;
            const slugCollision = await this.prisma.site.findUnique({ where: { slug: finalSlug } });
            if (slugCollision) {
                finalSlug = `${slug}-${Date.now().toString().slice(-4)}`;
            }
            site = await this.prisma.site.create({
                data: {
                    botId: data.botId || null,
                    userId: data.userId,
                    slug: finalSlug,
                    appName: data.appName,
                    theme: data.theme || 'glassmorphism',
                    themeColor: data.themeColor || '#00D9FF',
                    sourceCode: data.sourceCode,
                    files: filesStr,
                    blocks: blocksStr,
                },
            });
        }
        await this.mazaikaDb.save('global', `site_${site.slug}`, {
            id: site.id,
            slug: site.slug,
            appName: site.appName,
            sourceCode: site.sourceCode,
            updatedAt: site.updatedAt,
        }, `site_${site.slug}`);
        if (site.botId) {
            await this.mazaikaDb.save('global', `site_${site.botId}`, {
                id: site.id,
                slug: site.slug,
                appName: site.appName,
                sourceCode: site.sourceCode,
                updatedAt: site.updatedAt,
            }, `site_${site.botId}`);
        }
        return site;
    }
    async deleteSite(id) {
        return this.prisma.site.delete({ where: { id } });
    }
    async publishToCloudflare(id, host) {
        const site = await this.prisma.site.findUnique({ where: { id } });
        if (!site)
            throw new common_1.NotFoundException('Site not found');
        const result = await this.cloudflare.deployUserSite(site.slug, site.sourceCode, undefined, host);
        await this.prisma.site.update({
            where: { id: site.id },
            data: {
                cloudflareUrl: result.url,
                isPublished: true,
            },
        });
        return result;
    }
};
exports.SiteService = SiteService;
exports.SiteService = SiteService = SiteService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mazaika_db_service_1.MazaikaDbService,
        cloudflare_service_1.CloudflareService])
], SiteService);
//# sourceMappingURL=site.service.js.map