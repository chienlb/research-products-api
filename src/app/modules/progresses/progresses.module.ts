import { Module } from '@nestjs/common';
import { ProgressesService } from './progresses.service';
import { ProgressesController } from './progresses.controller';

@Module({
  controllers: [ProgressesController],
  providers: [ProgressesService],
})
export class ProgressesModule {}
