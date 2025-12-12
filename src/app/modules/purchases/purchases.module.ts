import { forwardRef, Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Purchase, PurchaseSchema } from './schema/purchase.schema';
import { PaymentsModule } from '../payments/payments.module';
import { UsersModule } from '../users/users.module';
import { PackagesModule } from '../packages/packages.module';
import { RedisModule } from 'src/app/configs/redis/redis.module';
import { RedisService } from 'src/app/configs/redis/redis.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Purchase.name, schema: PurchaseSchema },
    ]),
    UsersModule,
    PackagesModule,
    forwardRef(() => PaymentsModule),
    RedisModule,
  ],
  controllers: [PurchasesController],
  providers: [PurchasesService, RedisService],
  exports: [PurchasesService, MongooseModule],
})
export class PurchasesModule { }
