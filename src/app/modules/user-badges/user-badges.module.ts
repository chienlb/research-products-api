import { Module } from '@nestjs/common';
import { UserBadgesService } from './user-badges.service';
import { UserBadgesController } from './user-badges.controller';

@Module({
  controllers: [UserBadgesController],
  providers: [UserBadgesService],
})
export class UserBadgesModule {}
