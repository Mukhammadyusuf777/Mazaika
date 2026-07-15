import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { BotModule } from './bot/bot.module';

import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, BotModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
