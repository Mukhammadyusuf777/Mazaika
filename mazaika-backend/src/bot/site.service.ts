import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MazaikaDbService } from '../cloud/mazaika-db.service';
import { CloudflareService } from '../cloud/cloudflare.service';

export class SaveSiteDto {
  botId?: string;
  userId!: string;
  appName!: string;
  slug?: string;
  theme?: string;
  themeColor?: string;
  sourceCode!: string;
  files?: Record<string, string> | string;
  blocks?: any[] | string;
}

@Injectable()
export class SiteService {
  private readonly logger = new Logger(SiteService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mazaikaDb: MazaikaDbService,
    private readonly cloudflare: CloudflareService
  ) {}

  async getSiteByIdOrSlug(identifier: string) {
    const site = await this.prisma.site.findFirst({
      where: {
        OR: [
          { id: identifier },
          { slug: identifier },
          { botId: identifier },
        ],
      },
    });

    if (!site) return null;

    let files = {};
    try {
      files = typeof site.files === 'string' ? JSON.parse(site.files) : site.files;
    } catch {}

    let blocks = [];
    try {
      blocks = site.blocks && typeof site.blocks === 'string' ? JSON.parse(site.blocks) : (site.blocks || []);
    } catch {}

    return {
      ...site,
      files,
      blocks,
    };
  }

  async getUserSites(userId: string) {
    const sites = await this.prisma.site.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    return sites.map(site => {
      let files = {};
      try {
        files = typeof site.files === 'string' ? JSON.parse(site.files) : site.files;
      } catch {}
      return { ...site, files };
    });
  }

  async saveSite(data: SaveSiteDto) {
    const slug = data.slug || data.appName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30) || `site-${Date.now().toString().slice(-6)}`;
    const filesStr = typeof data.files === 'object' ? JSON.stringify(data.files) : (data.files || '{}');
    const blocksStr = typeof data.blocks === 'object' ? JSON.stringify(data.blocks) : (data.blocks || '[]');

    // Check if site exists for this botId or slug
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
    } else {
      // Ensure unique slug
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

    // Cache in MazaikaDb for sub-millisecond edge resolution
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

  async deleteSite(id: string) {
    return this.prisma.site.delete({ where: { id } });
  }

  async publishToCloudflare(id: string, host?: string) {
    const site = await this.prisma.site.findUnique({ where: { id } });
    if (!site) throw new NotFoundException('Site not found');

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
}
