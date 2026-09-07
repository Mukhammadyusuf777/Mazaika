import { Controller, Get, Post, Delete, Body, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { SiteService, SaveSiteDto } from './site.service';

@Controller('sites')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Get('user/:userId')
  async getUserSites(@Param('userId') userId: string) {
    return this.siteService.getUserSites(userId);
  }

  @Get(':idOrSlug')
  async getSite(@Param('idOrSlug') identifier: string) {
    return this.siteService.getSiteByIdOrSlug(identifier);
  }

  @Post()
  async saveSite(@Body() data: SaveSiteDto) {
    return this.siteService.saveSite(data);
  }

  @Delete(':id')
  async deleteSite(@Param('id') id: string) {
    return this.siteService.deleteSite(id);
  }

  @Post(':id/publish')
  async publishSite(@Param('id') id: string, @Req() req: any) {
    const host = `${req.protocol}://${req.get('host')}`;
    return this.siteService.publishToCloudflare(id, host);
  }
}
