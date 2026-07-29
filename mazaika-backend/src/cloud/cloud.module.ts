import { Module } from '@nestjs/common';
import { MazaikaDbService } from './mazaika-db.service';
import { MazaikaEngineService } from './mazaika-engine.service';
import { MazaikaHostingController } from './mazaika-hosting.controller';

@Module({
  controllers: [MazaikaHostingController],
  providers: [MazaikaDbService, MazaikaEngineService],
  exports: [MazaikaDbService, MazaikaEngineService]
})
export class CloudModule {}
