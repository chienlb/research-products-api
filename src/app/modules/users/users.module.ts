import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schema/user.schema';
import { InvitationCodesModule } from '../invitation-codes/invitation-codes.module';
import { HistoryInvitationsModule } from '../history-invitations/history-invitations.module';
import { HistoryInvitationSchema } from '../history-invitations/schema/history-invitation.schema';
import { TokenSchema } from '../tokens/schema/token.schema';
import { RedisService } from 'src/app/configs/redis/redis.service';
import { RedisModule } from 'src/app/configs/redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'HistoryInvitation', schema: HistoryInvitationSchema },
      { name: 'Token', schema: TokenSchema }
    ]),
    forwardRef(() => InvitationCodesModule),
    RedisModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, RedisService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule { }
