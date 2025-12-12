import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './app/modules/users/users.module';
import { TokensModule } from './app/modules/tokens/tokens.module';
import { ProvincesModule } from './app/modules/provinces/provinces.module';
import { DistrictsModule } from './app/modules/districts/districts.module';
import { SchoolsModule } from './app/modules/schools/schools.module';
import { ClassesModule } from './app/modules/classes/classes.module';
import { GroupsModule } from './app/modules/groups/groups.module';
import { UnitsModule } from './app/modules/units/units.module';
import { LessonsModule } from './app/modules/lessons/lessons.module';
import { InvitationCodesModule } from './app/modules/invitation-codes/invitation-codes.module';
import { HistoryInvitationsModule } from './app/modules/history-invitations/history-invitations.module';
import { FeatureFlagsModule } from './app/modules/feature-flags/feature-flags.module';
import { BadgesModule } from './app/modules/badges/badges.module';
import { UserBadgesModule } from './app/modules/user-badges/user-badges.module';
import { LiteraturesModule } from './app/modules/literatures/literatures.module';
import { CompetitionsModule } from './app/modules/competitions/competitions.module';
import { PackagesModule } from './app/modules/packages/packages.module';
import { SubscriptionsModule } from './app/modules/subscriptions/subscriptions.module';
import { PaymentsModule } from './app/modules/payments/payments.module';
import { AssignmentsModule } from './app/modules/assignments/assignments.module';
import { SubmissionsModule } from './app/modules/submissions/submissions.module';
import { NotificationsModule } from './app/modules/notifications/notifications.module';
import { FeedbacksModule } from './app/modules/feedbacks/feedbacks.module';
import { SupportsModule } from './app/modules/supports/supports.module';
import { ProgressesModule } from './app/modules/progresses/progresses.module';
import { DiscussionsModule } from './app/modules/discussions/discussions.module';
import { GroupMessagesModule } from './app/modules/group-messages/group-messages.module';
import { MailModule } from './app/configs/mail/mail.module';

import { ConfigModule } from '@nestjs/config';
import { AuthsModule } from './app/modules/auths/auths.module';
import { MongoDBModule } from './app/configs/database/mongodb.config';
import { CloudflareModule } from './app/modules/cloudflare/cloudflare.module';
import { PurchasesModule } from './app/modules/purchases/purchases.module';
import { RedisModule } from './app/configs/redis/redis.module';

@Module({
  imports: [
    MongoDBModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    MailModule,
    UsersModule,
    TokensModule,
    ProvincesModule,
    DistrictsModule,
    SchoolsModule,
    ClassesModule,
    GroupsModule,
    UnitsModule,
    LessonsModule,
    InvitationCodesModule,
    HistoryInvitationsModule,
    FeatureFlagsModule,
    BadgesModule,
    UserBadgesModule,
    LiteraturesModule,
    CompetitionsModule,
    PackagesModule,
    SubscriptionsModule,
    PaymentsModule,
    AssignmentsModule,
    SubmissionsModule,
    NotificationsModule,
    FeedbacksModule,
    SupportsModule,
    ProgressesModule,
    DiscussionsModule,
    GroupMessagesModule,
    AuthsModule,
    CloudflareModule,
    PurchasesModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
