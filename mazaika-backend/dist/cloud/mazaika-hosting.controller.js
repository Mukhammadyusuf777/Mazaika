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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MazaikaHostingController = void 0;
const common_1 = require("@nestjs/common");
const mazaika_db_service_1 = require("./mazaika-db.service");
const cloudflare_service_1 = require("./cloudflare.service");
const prisma_service_1 = require("../prisma/prisma.service");
let MazaikaHostingController = class MazaikaHostingController {
    db;
    cloudflare;
    prisma;
    constructor(db, cloudflare, prisma) {
        this.db = db;
        this.cloudflare = cloudflare;
        this.prisma = prisma;
    }
    async renderSite(identifier, req, res) {
        let htmlContent = '';
        let siteTitle = 'Mazaika Website';
        let foundSite = null;
        try {
            foundSite = await this.prisma.site.findFirst({
                where: {
                    OR: [
                        { slug: identifier },
                        { id: identifier },
                        { botId: identifier },
                    ],
                },
            });
            if (foundSite) {
                htmlContent = foundSite.sourceCode || '';
                siteTitle = foundSite.appName || 'Mazaika App';
                this.prisma.site.update({
                    where: { id: foundSite.id },
                    data: { views: { increment: 1 } },
                }).catch(() => { });
            }
        }
        catch (e) {
        }
        if (!htmlContent) {
            const siteData = await this.db.find('global', `site_${identifier}`);
            if (siteData && siteData.length > 0) {
                htmlContent = siteData[0].sourceCode || siteData[0].html || siteData[0];
                siteTitle = siteData[0].appName || 'Mazaika App';
            }
        }
        if (!htmlContent) {
            res.status(common_1.HttpStatus.NOT_FOUND).type('text/html').send(`
        <!DOCTYPE html>
        <html lang="uz">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Mazaika Cloud Hosting</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #06070B; color: #F8FAFC; }
            .card { background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); padding: 2.5rem; border-radius: 20px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5); text-align: center; max-width: 480px; width: 90%; backdrop-filter: blur(20px); }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; background: rgba(0, 217, 255, 0.12); border: 1px solid rgba(0, 217, 255, 0.3); color: #00D9FF; font-size: 11px; font-weight: 700; margin-bottom: 16px; text-transform: uppercase; }
            h1 { font-size: 22px; font-weight: 800; margin-bottom: 10px; color: #FFF; }
            p { font-size: 13.5px; color: #94A3B8; line-height: 1.6; margin-bottom: 20px; }
            .slug-box { background: rgba(0, 0, 0, 0.4); padding: 10px; border-radius: 10px; font-family: monospace; color: #00F5C4; font-size: 13px; word-break: break-all; margin-bottom: 20px; }
            a { color: #00D9FF; text-decoration: none; font-weight: 600; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">Mazaika Edge Server</div>
            <h1>Sayt Hali Faollashtirilmagan</h1>
            <p>Ushbu identifikator bo'yicha sayt topilmadi yoki hali saqlanmagan:</p>
            <div class="slug-box">${identifier}</div>
            <p>Mazaika AI Studio orqali loyihani saqlang va qayta kiring.</p>
            <a href="/">← Bosh sahifaga qaytish</a>
          </div>
        </body>
        </html>
      `);
            return;
        }
        const injection = `
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://telegram.org/js/telegram-web-app.js"></script>
      <script>
        // Telegram WebApp Auto-Expansion
        if (window.Telegram && window.Telegram.WebApp) {
          window.Telegram.WebApp.ready();
          window.Telegram.WebApp.expand();
        }
        // Prevent Iframe navigation from breaking parent app
        document.addEventListener('click', function(e) {
          var target = e.target;
          while (target && target.tagName !== 'A') {
            target = target.parentNode;
          }
          if (target && target.tagName === 'A') {
            var href = target.getAttribute('href');
            var targetAttr = target.getAttribute('target');
            if (targetAttr === '_blank') return;
            if (href && href.startsWith('#')) return;
            if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
              target.setAttribute('target', '_blank');
            }
          }
        });
      </script>
    `;
        let finalHtml = htmlContent;
        if (finalHtml.includes('</head>')) {
            finalHtml = finalHtml.replace('</head>', `${injection}\n</head>`);
        }
        else if (finalHtml.includes('<body')) {
            finalHtml = `${injection}\n${finalHtml}`;
        }
        else {
            finalHtml = `<!DOCTYPE html><html><head>${injection}<title>${siteTitle}</title></head><body>${finalHtml}</body></html>`;
        }
        res
            .header('Content-Type', 'text/html; charset=utf-8')
            .header('Cache-Control', 'public, max-age=60, s-maxage=300')
            .header('X-Powered-By', 'Mazaika Edge Server')
            .send(finalHtml);
    }
    async publishToCloudflare(identifier, body, req) {
        let site = await this.prisma.site.findFirst({
            where: {
                OR: [
                    { slug: identifier },
                    { id: identifier },
                    { botId: identifier },
                ],
            },
        });
        const slug = body.slug || site?.slug || identifier;
        const html = body.html || site?.sourceCode || '';
        const host = `${req.protocol}://${req.get('host')}`;
        const deployResult = await this.cloudflare.deployUserSite(slug, html, undefined, host);
        if (site) {
            await this.prisma.site.update({
                where: { id: site.id },
                data: {
                    cloudflareUrl: deployResult.url,
                    isPublished: true,
                },
            });
        }
        return deployResult;
    }
};
exports.MazaikaHostingController = MazaikaHostingController;
__decorate([
    (0, common_1.Get)('sites/:siteIdOrSlug'),
    __param(0, (0, common_1.Param)('siteIdOrSlug')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], MazaikaHostingController.prototype, "renderSite", null);
__decorate([
    (0, common_1.Post)('sites/:idOrSlug/publish-cloudflare'),
    __param(0, (0, common_1.Param)('idOrSlug')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], MazaikaHostingController.prototype, "publishToCloudflare", null);
exports.MazaikaHostingController = MazaikaHostingController = __decorate([
    (0, common_1.Controller)('cloud'),
    __metadata("design:paramtypes", [mazaika_db_service_1.MazaikaDbService,
        cloudflare_service_1.CloudflareService,
        prisma_service_1.PrismaService])
], MazaikaHostingController);
//# sourceMappingURL=mazaika-hosting.controller.js.map