import { Module } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { BadgesController } from './badges.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Badge, BadgeSchema } from './schema/badge.schema';
import { UsersModule } from '../users/users.module';
import { RedisModule } from 'src/app/configs/redis/redis.module';
import { RedisService } from 'src/app/configs/redis/redis.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Badge.name, schema: BadgeSchema }]), UsersModule, RedisModule],
  controllers: [BadgesController],
  providers: [BadgesService, RedisService],
  exports: [BadgesService],
})
export class BadgesModule { }
