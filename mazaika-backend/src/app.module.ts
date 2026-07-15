import { Module } from '@nestjs/common';
import { FirebaseModule } from './firebase/firebase.module';
import { BotModule } from './bot/bot.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [FirebaseModule, BotModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

