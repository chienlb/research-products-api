import { Module } from '@nestjs/common';
import { SupportsService } from './supports.service';
import { SupportsController } from './supports.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Support, SupportSchema } from './schema/support.schema';
import { UsersModule } from '../users/users.module';
import { CloudflareModule } from '../cloudflare/cloudflare.module';
import { RedisModule } from 'src/app/configs/redis/redis.module';
import { RedisService } from 'src/app/configs/redis/redis.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Support.name, schema: SupportSchema },
    ]),
    UsersModule,
    CloudflareModule,
    RedisModule,
  ],
  controllers: [SupportsController],
  providers: [SupportsService, RedisService],
  exports: [SupportsService, MongooseModule],
})
export class SupportsModule { }
