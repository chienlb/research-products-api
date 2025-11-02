import { Module } from '@nestjs/common';
import { SupportsService } from './supports.service';
import { SupportsController } from './supports.controller';

@Module({
  controllers: [SupportsController],
  providers: [SupportsService],
})
export class SupportsModule {}
