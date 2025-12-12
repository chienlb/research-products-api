import { forwardRef, Module } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { UsersModule } from '../users/users.module';
import { Package, PackageSchema } from './schema/package.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { InvitationCodesModule } from '../invitation-codes/invitation-codes.module';
import { RedisModule } from 'src/app/configs/redis/redis.module';
import { RedisService } from 'src/app/configs/redis/redis.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Package.name, schema: PackageSchema },
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => InvitationCodesModule),
    RedisModule,
  ],
  controllers: [PackagesController],
  providers: [PackagesService, RedisService],
  exports: [PackagesService],
})
export class PackagesModule { }
