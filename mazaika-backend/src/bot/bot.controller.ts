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
    const contactsSnap = await this.firebaseService.db.collection('bots').doc(botId).collection('contacts').get();
    const totalContacts = contactsSnap.size;
    
    return {
      totalContacts,
      todayMessages: totalContacts * 2,
      chartData: [
        { name: 'Dush', users: 5, msgs: 12 },
        { name: 'Sesh', users: 12, msgs: 25 },
        { name: 'Chor', users: 18, msgs: 42 },
        { name: 'Pay', users: 24, msgs: 38 },
        { name: 'Juma', users: 35, msgs: 70 },
        { name: 'Shan', users: 48, msgs: 110 },
        { name: 'Yak', users: 54, msgs: 95 },
      ]
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

