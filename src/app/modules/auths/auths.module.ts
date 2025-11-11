import { Module } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { AuthsController } from './auths.controller';
import { InvitationCodesService } from '../invitation-codes/invitation-codes.service';
import { HistoryInvitationsService } from '../history-invitations/history-invitations.service';
import { UsersService } from '../users/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schema/user.schema';
import {
  InvitationCode,
  InvitationCodeSchema,
} from '../invitation-codes/schema/invitation-code.schema';
import {
  HistoryInvitation,
  HistoryInvitationSchema,
} from '../history-invitations/schema/history-invitation.schema';
import { TokensService } from '../tokens/tokens.service';
import { Token, TokenSchema } from '../tokens/schema/token.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: InvitationCode.name, schema: InvitationCodeSchema },
      { name: HistoryInvitation.name, schema: HistoryInvitationSchema },
      { name: Token.name, schema: TokenSchema },
    ]),
  ],
  controllers: [AuthsController],
  providers: [
    AuthsService,
    InvitationCodesService,
    HistoryInvitationsService,
    UsersService,
    TokensService,
  ],
})
export class AuthsModule { }
