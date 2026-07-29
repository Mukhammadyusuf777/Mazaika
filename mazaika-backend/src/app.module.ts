import { Module } from '@nestjs/common';
import { FirebaseModule } from './firebase/firebase.module';
import { BotModule } from './bot/bot.module';
import { AiModule } from './ai/ai.module';
import { CloudModule } from './cloud/cloud.module';

@Module({
  imports: [FirebaseModule, BotModule, AiModule, CloudModule],
  controllers: [],
  providers: [],
})
export class AppModule {}



