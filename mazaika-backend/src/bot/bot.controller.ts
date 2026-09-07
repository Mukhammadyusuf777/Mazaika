import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { BotManagerService } from './bot-manager.service';
import { BotService } from './bot.service';
import { FirebaseService } from '../firebase/firebase.service';

@Controller('bots')
export class BotController {
  constructor(
    private readonly botManager: BotManagerService,
    private readonly botService: BotService,
    private readonly firebaseService: FirebaseService
  ) {}

  @Get('user/:userId')
  async getUserBots(@Param('userId') userId: string) {
    const bots = await this.botService.getUserBots(userId);
    return bots.map((bot) => {
      const status = this.botManager.getBotStatus(bot.id);
      return {
        ...bot,
        isRunning: status.isRunning,
      };
    });
  }

  @Get(':id')
  async getBot(@Param('id') id: string) {
    // 1. Try Prisma first
    const bot = await this.botService.getBotById(id);
    if (bot) {
      const status = this.botManager.getBotStatus(id);
      return { ...bot, isRunning: status.isRunning };
    }

    // 2. Fallback to Firebase
    const fbBot = await this.firebaseService.getBot(id);
    if (fbBot) {
      const status = this.botManager.getBotStatus(id);
      return { ...fbBot, isRunning: status.isRunning };
    }

    return null;
  }

  @Post()
  async createBot(@Body() data: any) {
    return this.botService.createBot(data);
  }

  @Put(':id')
  async updateBot(@Param('id') id: string, @Body() data: any) {
    return this.botService.updateBot(id, data);
  }

  @Delete(':id')
  async deleteBot(@Param('id') id: string) {
    // Stop if running
    try {
      await this.botManager.stopBot(id);
    } catch {}
    return this.botService.deleteBot(id);
  }

  @Post(':id/start')
  async startBot(@Param('id') id: string) {
    let token = '';
    const bot = await this.botService.getBotById(id);
    if (bot && bot.token) {
      token = bot.token;
    } else {
      const fbBot = await this.firebaseService.getBot(id);
      if (fbBot && fbBot.token) token = fbBot.token;
    }

    if (!token || token.startsWith('TEST_TOKEN')) {
      return { error: 'Bot token kiritilmagan yoki noto\'g\'ri' };
    }

    return this.botManager.startBot(id, token);
  }

  @Post(':id/stop')
  async stopBot(@Param('id') id: string) {
    return this.botManager.stopBot(id);
  }

  @Post(':id/contacts/:contactId/messages')
  async sendMessage(
    @Param('id') botId: string,
    @Param('contactId') contactId: string,
    @Body() data: { text: string }
  ) {
    if (this.firebaseService.db) {
      const snap = await this.firebaseService.db.collection('bots').doc(botId).collection('contacts').doc(contactId).get();
      if (snap.exists) {
        const contact = snap.data();
        if (contact) {
          const success = await this.botManager.sendMessageToUser(botId, contact.telegramId, data.text);
          if (success) {
            await this.firebaseService.addMessage(botId, contactId, data.text, 'outbound');
            return { success: true };
          }
        }
      }
    }
    return { success: false, message: 'Bot yoki kontakt topilmadi' };
  }

  @Post(':id/broadcast')
  async broadcast(@Param('id') botId: string, @Body() data: { text: string }) {
    if (this.firebaseService.db) {
      const snap = await this.firebaseService.db.collection('bots').doc(botId).collection('contacts').get();
      let successCount = 0;
      let failCount = 0;

      for (const doc of snap.docs) {
        const contact = doc.data();
        const success = await this.botManager.sendMessageToUser(botId, contact.telegramId, data.text);
        if (success) {
          successCount++;
          await this.firebaseService.addMessage(botId, doc.id, data.text, 'outbound');
        } else {
          failCount++;
        }
      }
      return { successCount, failCount };
    }
    return { successCount: 0, failCount: 0 };
  }

  @Get(':id/analytics')
  async getAnalytics(@Param('id') botId: string) {
    const days = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan'];
    const now = new Date();
    const chartDataMap = new Map();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];
      chartDataMap.set(dateStr, { name: dayName, users: 0, msgs: 0 });
    }

    let totalContacts = 0;
    let todayMessages = 0;

    if (this.firebaseService.db) {
      try {
        const db = this.firebaseService.db;
        const contactsSnap = await db.collection('bots').doc(botId).collection('contacts').get();
        totalContacts = contactsSnap.size;
        const todayStr = now.toISOString().split('T')[0];

        for (const doc of contactsSnap.docs) {
          const data = doc.data();
          if (data.createdAt) {
            const d = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            const dateStr = d.toISOString().split('T')[0];
            if (chartDataMap.has(dateStr)) {
              chartDataMap.get(dateStr).users += 1;
            }
          }

          const messagesSnap = await db.collection('bots').doc(botId).collection('contacts').doc(doc.id).collection('messages').get();
          for (const msgDoc of messagesSnap.docs) {
            const msg = msgDoc.data();
            if (msg.createdAt) {
              const d = msg.createdAt.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt);
              const dateStr = d.toISOString().split('T')[0];
              if (dateStr === todayStr) todayMessages += 1;
              if (chartDataMap.has(dateStr)) chartDataMap.get(dateStr).msgs += 1;
            }
          }
        }
      } catch {}
    }

    const chartData = Array.from(chartDataMap.values()).map(({ name, users, msgs }) => ({ name, users, msgs }));
    return {
      totalContacts,
      todayMessages,
      chartData,
    };
  }

  @Post(':id/menu-button')
  async setMenuButton(@Param('id') id: string, @Body() data: { text: string; url: string }) {
    return this.botManager.setMenuButton(id, data.text, data.url);
  }

  @Delete(':id/menu-button')
  async resetMenuButton(@Param('id') id: string) {
    return this.botManager.resetMenuButton(id);
  }
}
