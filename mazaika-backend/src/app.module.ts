import { Module } from '@nestjs/common';
import { FirebaseModule } from './firebase/firebase.module';
import { BotModule } from './bot/bot.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [FirebaseModule, BotModule, AiModule],
  controllers: [],
  providers: [],
})
export class AppModule {}


