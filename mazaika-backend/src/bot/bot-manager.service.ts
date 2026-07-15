import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { WorkflowService } from './workflow.service';
import { Telegraf } from 'telegraf';

@Injectable()
export class BotManagerService implements OnModuleInit {
  private readonly logger = new Logger(BotManagerService.name);
  
  // Store active Telegraf instances by botId
  private activeBots: Map<string, Telegraf> = new Map();

  constructor(
    private firebaseService: FirebaseService,
    private workflowService: WorkflowService
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing Bot Manager...');
    // Load all active bots from DB and start them
    const bots = await this.firebaseService.getActiveBots();

    for (const bot of bots) {
      if (bot.token) {
        await this.startBot(bot.id, bot.token);
      }
    }
  }

  async startBot(botId: string, token: string) {
    if (this.activeBots.has(botId)) {
      this.logger.warn(`Bot ${botId} is already running.`);
      return { success: false, message: 'Already running' };
    }

    try {
      const telegrafBot = new Telegraf(token);
      
      // Pre-flight check: validate token before launching
      await telegrafBot.telegram.getMe();

      // Handle all incoming messages (text, contact, location)
      telegrafBot.on('message', async (ctx) => {
        const telegramId = ctx.from.id.toString();
        
        if (ctx.message && 'text' in ctx.message) {
          await this.workflowService.processIncomingMessage(botId, telegramId, ctx.message.text, ctx);
        } else if (ctx.message && 'contact' in ctx.message && ctx.message.contact) {
          const phone = ctx.message.contact.phone_number;
          await this.workflowService.processIncomingMessage(botId, telegramId, `contact:${phone}`, ctx);
        } else if (ctx.message && 'location' in ctx.message && ctx.message.location) {
          const { latitude, longitude } = ctx.message.location;
          await this.workflowService.processIncomingMessage(botId, telegramId, `location:${latitude},${longitude}`, ctx);
        }
      });

      telegrafBot.on('callback_query', async (ctx) => {
        if ('data' in ctx.callbackQuery) {
          const data = ctx.callbackQuery.data;
          const telegramId = ctx.from.id.toString();
          await ctx.answerCbQuery().catch(() => {});
          await this.workflowService.processIncomingMessage(botId, telegramId, data, ctx);
        }
      });

      // Start polling with error handling
      telegrafBot.launch().catch(async (error) => {
        this.logger.error(`Bot ${botId} crashed during polling: ${error.message}`);
        this.activeBots.delete(botId);
        await this.firebaseService.updateBotStatus(botId, 'error');
      });
      
      this.activeBots.set(botId, telegrafBot);
      this.logger.log(`Bot ${botId} started successfully.`);

      // Update DB status
      await this.firebaseService.updateBotStatus(botId, 'active');

      return { success: true };
    } catch (error: any) {
      this.logger.error(`Failed to start bot ${botId}: ${error.message}`);
      
      // Update DB status to error
      await this.firebaseService.updateBotStatus(botId, 'error');

      return { success: false, message: error.message };
    }
  }

  async stopBot(botId: string) {
    const telegrafBot = this.activeBots.get(botId);
    
    if (telegrafBot) {
      telegrafBot.stop('API request');
      this.activeBots.delete(botId);
      this.logger.log(`Bot ${botId} stopped.`);

      await this.firebaseService.updateBotStatus(botId, 'paused');

      return { success: true };
    }

    return { success: false, message: 'Bot not running' };
  }


  getBotStatus(botId: string) {
    return { isRunning: this.activeBots.has(botId) };
  }

  async sendMessageToUser(botId: string, telegramId: string, text: string): Promise<boolean> {
    const telegrafBot = this.activeBots.get(botId);
    if (!telegrafBot) return false;

    try {
      await telegrafBot.telegram.sendMessage(telegramId, text);
      return true;
    } catch (e: any) {
      this.logger.error(`Failed to send message from bot ${botId} to ${telegramId}: ${e.message}`);
      return false;
    }
  }
}
