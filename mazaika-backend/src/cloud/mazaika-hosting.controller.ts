import { Controller, Get, Param, Header } from '@nestjs/common';
import { MazaikaDbService } from './mazaika-db.service';

@Controller('cloud')
export class MazaikaHostingController {
  constructor(private readonly db: MazaikaDbService) {}

  @Get('sites/:siteSlug')
  @Header('Content-Type', 'text/html')
  async renderSite(@Param('siteSlug') slug: string) {
    const siteData = await this.db.find('global', `site_${slug}`);
    
    if (!siteData || siteData.length === 0) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Mazaika Hosting</title>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f2f5; margin: 0; }
            .card { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
            h1 { color: #2563eb; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Mazaika Cloud Hosting</h1>
            <p>Site <b>${slug}</b> is active and ready for AI deployment.</p>
          </div>
        </body>
        </html>
      `;
    }
    
    // Return the rendered HTML directly from our core
    return siteData[0].html || siteData[0];
  }
}
