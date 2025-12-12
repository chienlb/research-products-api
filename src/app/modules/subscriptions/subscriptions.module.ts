import { Module, forwardRef } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Subscription, SubscriptionSchema } from './schema/subscription.schema';
import { UsersModule } from '../users/users.module';
import { PackagesModule } from '../packages/packages.module';
import { RedisModule } from 'src/app/configs/redis/redis.module';
import { RedisService } from 'src/app/configs/redis/redis.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => PackagesModule),
    RedisModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, RedisService],
  exports: [SubscriptionsService, MongooseModule],
})
export class SubscriptionsModule { }
