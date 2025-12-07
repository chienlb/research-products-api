import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { UsersModule } from '../users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schema/payment.schema';
import { PackagesModule } from '../packages/packages.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { PurchasesModule } from '../purchases/purchases.module';
import { Package, PackageSchema } from '../packages/schema/package.schema';
import { Subscription, SubscriptionSchema } from '../subscriptions/schema/subscription.schema';
import { Purchase, PurchaseSchema } from '../purchases/schema/purchase.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Purchase.name, schema: PurchaseSchema },
      { name: Package.name, schema: PackageSchema },
    ]),
    UsersModule,
    PackagesModule,
    SubscriptionsModule,
    PurchasesModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService, MongooseModule],
})
export class PaymentsModule { }
