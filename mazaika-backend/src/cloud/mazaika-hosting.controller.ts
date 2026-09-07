import { Controller, Get, Post, Param, Header, Res, Req, HttpStatus, Body } from '@nestjs/common';
import { Response, Request } from 'express';
import { MazaikaDbService } from './mazaika-db.service';
import { CloudflareService } from './cloudflare.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('cloud')
export class MazaikaHostingController {
  constructor(
    private readonly db: MazaikaDbService,
    private readonly cloudflare: CloudflareService,
    private readonly prisma: PrismaService
  ) {}

  @Get('sites/:siteIdOrSlug')
  async renderSite(
    @Param('siteIdOrSlug') identifier: string,
    @Req() req: any,
    @Res() res: any
  ) {
    let htmlContent = '';
    let siteTitle = 'Mazaika Website';
    let foundSite: any = null;

    // 1. Try finding in Prisma database (by slug, id, or botId)
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

        // Increment view count asynchronously
        this.prisma.site.update({
          where: { id: foundSite.id },
          data: { views: { increment: 1 } },
        }).catch(() => {});
      }
    } catch (e) {
      // Prisma error fallback
    }

    // 2. If not found in Prisma, try finding in MazaikaDb cache
    if (!htmlContent) {
      const siteData = await this.db.find('global', `site_${identifier}`);
      if (siteData && siteData.length > 0) {
        htmlContent = siteData[0].sourceCode || siteData[0].html || siteData[0];
        siteTitle = siteData[0].appName || 'Mazaika App';
      }
    }

    // 3. Fallback: 404 / Starter page
    if (!htmlContent) {
      res.status(HttpStatus.NOT_FOUND).type('text/html').send(`
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

    // 4. Inject Telegram WebApp SDK, Viewport, and Iframe Anti-Breakout script
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
    } else if (finalHtml.includes('<body')) {
      finalHtml = `${injection}\n${finalHtml}`;
    } else {
      finalHtml = `<!DOCTYPE html><html><head>${injection}<title>${siteTitle}</title></head><body>${finalHtml}</body></html>`;
    }

    // Fast Cache headers (sub-millisecond repeat access)
    res
      .header('Content-Type', 'text/html; charset=utf-8')
      .header('Cache-Control', 'public, max-age=60, s-maxage=300')
      .header('X-Powered-By', 'Mazaika Edge Server')
      .send(finalHtml);
  }

  @Post('sites/:idOrSlug/publish-cloudflare')
  async publishToCloudflare(
    @Param('idOrSlug') identifier: string,
    @Body() body: { html?: string; slug?: string },
    @Req() req: any
  ) {
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
}
