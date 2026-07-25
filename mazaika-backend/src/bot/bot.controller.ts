import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';

import { BotManagerService } from './bot-manager.service';
import { FirebaseService } from '../firebase/firebase.service';

@Controller('bots')
export class BotController {
  constructor(
    private readonly botManager: BotManagerService,
    private firebaseService: FirebaseService
  ) {}

  @Get(':id')
  async getBot(@Param('id') id: string) {
    const bot = await this.firebaseService.getBot(id);
    if (bot) {
      const status = this.botManager.getBotStatus(id);
      return { ...bot, isRunning: status.isRunning };
    }
    return null;
  }

  @Post(':id/start')
  async startBot(@Param('id') id: string) {
    const bot = await this.firebaseService.getBot(id);
    if (!bot) return { error: 'Bot not found' };
    if (!bot.token) return { error: 'Bot token is empty' };
    if (bot.token === 'TEST_TOKEN') return { error: 'Bot token is empty' };
    
    return this.botManager.startBot(bot.id, bot.token);
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
    const snap = await this.firebaseService.db.collection('bots').doc(botId).collection('contacts').doc(contactId).get();
    if (!snap.exists) return { error: 'Contact not found' };
    const contact = snap.data();
    if (!contact) return { error: 'Contact not found' };

    // Send via telegraf
    const success = await this.botManager.sendMessageToUser(botId, contact.telegramId, data.text);

    if (!success) return { error: 'Failed to send message (bot might be offline)' };

    // Save to Firestore
    await this.firebaseService.addMessage(botId, contactId, data.text, 'outbound');

    return { success: true };
  }

  @Post(':id/broadcast')
  async broadcast(@Param('id') botId: string, @Body() data: { text: string }) {
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

  @Get(':id/analytics')
  async getAnalytics(@Param('id') botId: string) {
    const db = this.firebaseService.db;
    const contactsSnap = await db.collection('bots').doc(botId).collection('contacts').get();
    const totalContacts = contactsSnap.size;
    
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

    let todayMessages = 0;
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
          
          if (dateStr === todayStr) {
            todayMessages += 1;
          }

          if (chartDataMap.has(dateStr)) {
            chartDataMap.get(dateStr).msgs += 1;
          }
        }
      }
    }

    const chartData = Array.from(chartDataMap.values()).map(({ name, users, msgs }) => ({ name, users, msgs }));

    return {
      totalContacts,
      todayMessages,
      chartData
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

