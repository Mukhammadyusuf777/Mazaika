import { Module } from '@nestjs/common';
import { FirebaseModule } from './firebase/firebase.module';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [FirebaseModule, BotModule],
  controllers: [],
  providers: [],
})
export class AppModule {}


