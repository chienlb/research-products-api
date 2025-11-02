import { Module } from '@nestjs/common';
import { LiteraturesService } from './literatures.service';
import { LiteraturesController } from './literatures.controller';

@Module({
  controllers: [LiteraturesController],
  providers: [LiteraturesService],
})
export class LiteraturesModule {}
