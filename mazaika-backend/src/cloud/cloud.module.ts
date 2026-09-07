import { Module } from '@nestjs/common';
import { MazaikaDbService } from './mazaika-db.service';
import { MazaikaEngineService } from './mazaika-engine.service';
import { MazaikaHostingController } from './mazaika-hosting.controller';
import { CloudflareService } from './cloudflare.service';

@Module({
  controllers: [MazaikaHostingController],
  providers: [MazaikaDbService, MazaikaEngineService, CloudflareService],
  exports: [MazaikaDbService, MazaikaEngineService, CloudflareService],
})
export class CloudModule {}
