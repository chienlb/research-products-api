import { Module } from '@nestjs/common';
import { UserBadgesService } from './user-badges.service';
import { UserBadgesController } from './user-badges.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserBadge, UserBadgeSchema } from './schema/user-badge.schema';
import { UsersModule } from '../users/users.module';
import { BadgesModule } from '../badges/badges.module';
import { RedisModule } from 'src/app/configs/redis/redis.module';
import { RedisService } from 'src/app/configs/redis/redis.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserBadge.name, schema: UserBadgeSchema },
    ]),
    UsersModule,
    BadgesModule,
    RedisModule,
  ],
  controllers: [UserBadgesController],
  providers: [UserBadgesService, RedisService],
  exports: [UserBadgesService],
})
export class UserBadgesModule { }
