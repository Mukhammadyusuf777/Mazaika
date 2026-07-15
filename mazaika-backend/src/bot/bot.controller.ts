import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotManagerService } from './bot-manager.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('bots')
export class BotController {
  constructor(
    private readonly botService: BotService,
    private readonly botManager: BotManagerService,
    private prisma: PrismaService
  ) {}

  @Get('user/:userId')
  async getUserBots(@Param('userId') userId: string) {
    return this.botService.getUserBots(userId);
  }

  @Get(':id')
  async getBot(@Param('id') id: string) {
    const bot = await this.botService.getBotById(id);
    if (bot) {
      const status = this.botManager.getBotStatus(id);
      return { ...bot, isRunning: status.isRunning };
    }
    return null;
  }

  @Post()
  async createBot(@Body() data: { name: string; token: string; userId: string; template?: string }) {
    return this.botService.createBot(data);
  }

  @Post(':id/start')
  async startBot(@Param('id') id: string) {
    const bot = await this.prisma.bot.findUnique({ where: { id } });
    if (!bot) return { error: 'Bot not found' };
    if (!bot.token) return { error: 'Bot token is empty' };
    
    return this.botManager.startBot(bot.id, bot.token);
  }

  @Post(':id/stop')
  async stopBot(@Param('id') id: string) {
    return this.botManager.stopBot(id);
  }

  @Get(':id/contacts')
  async getContacts(@Param('id') id: string) {
    return this.prisma.contact.findMany({
      where: { botId: id },
      orderBy: { updatedAt: 'desc' }
    });
  }

  @Get(':id/contacts/:contactId/messages')
  async getMessages(@Param('id') id: string, @Param('contactId') contactId: string) {
    return this.prisma.message.findMany({
      where: { contactId },
      orderBy: { createdAt: 'asc' }
    });
  }

  @Post(':id/contacts/:contactId/messages')
  async sendMessage(
    @Param('id') botId: string,
    @Param('contactId') contactId: string,
    @Body() data: { text: string }
  ) {
    const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
    if (!contact) return { error: 'Contact not found' };

    // Send via telegraf
    const success = await this.botManager.sendMessageToUser(botId, contact.telegramId, data.text);
    if (!success) return { error: 'Failed to send message (bot might be offline)' };

    // Save to DB
    const message = await this.prisma.message.create({
      data: {
        text: data.text,
        direction: 'outbound',
        contactId: contact.id
      }
    });

    return message;
  }

  @Post(':id/broadcast')
  async broadcast(@Param('id') botId: string, @Body() data: { text: string }) {
    const contacts = await this.prisma.contact.findMany({ where: { botId } });
    let successCount = 0;
    let failCount = 0;

    for (const contact of contacts) {
      const success = await this.botManager.sendMessageToUser(botId, contact.telegramId, data.text);
      if (success) {
        successCount++;
        await this.prisma.message.create({
          data: {
            text: data.text,
            direction: 'outbound',
            contactId: contact.id
          }
        });
      } else {
        failCount++;
      }
    }

    return { successCount, failCount };
  }

  @Get(':id/analytics')
  async getAnalytics(@Param('id') botId: string) {
    const totalContacts = await this.prisma.contact.count({ where: { botId } });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find all contacts for this bot to get their messages
    const contacts = await this.prisma.contact.findMany({ where: { botId }, select: { id: true } });
    const contactIds = contacts.map(c => c.id);
    
    const todayMessages = await this.prisma.message.count({
      where: {
        contactId: { in: contactIds },
        createdAt: { gte: today }
      }
    });

    // Mocking chart data for the last 7 days based on actual DB records is a bit complex in raw SQLite via Prisma.
    // For MVP, we will fetch all contacts and messages, then group them in JS.
    const allContacts = await this.prisma.contact.findMany({ where: { botId } });
    const allMessages = await this.prisma.message.findMany({ where: { contactId: { in: contactIds } } });
    
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('ru-RU', { weekday: 'short' });
      
      const startOfDay = new Date(d);
      startOfDay.setHours(0,0,0,0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23,59,59,999);
      
      const dailyUsers = allContacts.filter(c => c.createdAt >= startOfDay && c.createdAt <= endOfDay).length;
      const dailyMsgs = allMessages.filter(m => m.createdAt >= startOfDay && m.createdAt <= endOfDay).length;
      
      chartData.push({
        name: dateStr,
        users: dailyUsers,
        msgs: dailyMsgs
      });
    }

    return {
      totalContacts,
      todayMessages,
      chartData
    };
  }

  @Delete(':id')
  async deleteBot(@Param('id') id: string) {
    await this.botManager.stopBot(id);
    return this.botService.deleteBot(id);
  }

  @Put(':id')
  async updateBot(@Param('id') id: string, @Body() data: { name?: string; token?: string; status?: string }) {
    const oldBot = await this.prisma.bot.findUnique({ where: { id } });
    const bot = await this.botService.updateBot(id, data);
    
    // Restart Telegram bot if token is updated
    if (data.token && oldBot && oldBot.token !== data.token) {
      const status = this.botManager.getBotStatus(id);
      if (status.isRunning) {
        await this.botManager.stopBot(id);
        await this.botManager.startBot(id, data.token);
      }
    }
    return bot;
  }

  @Get(':id/webhooks')
  async getWebhooks(@Param('id') botId: string) {
    return this.botService.getWebhooks(botId);
  }

  @Post(':id/webhooks')
  async createWebhook(
    @Param('id') botId: string,
    @Body() data: { name: string; url: string; method?: string; active?: boolean }
  ) {
    return this.botService.createWebhook(botId, data);
  }

  @Delete(':id/webhooks/:webhookId')
  async deleteWebhook(@Param('webhookId') webhookId: string) {
    return this.botService.deleteWebhook(webhookId);
  }
}
