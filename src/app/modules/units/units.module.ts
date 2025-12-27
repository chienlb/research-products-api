import { Module, forwardRef } from '@nestjs/common';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { Unit, UnitSchema } from './schema/unit.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schema/user.schema';
import { UsersModule } from '../users/users.module';
import { RedisModule } from 'src/app/configs/redis/redis.module';
import { RedisService } from 'src/app/configs/redis/redis.service';
import { UnitProgressModule } from '../unit-progress/unit-progress.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Unit.name, schema: UnitSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UsersModule,
    RedisModule,
    forwardRef(() => UnitProgressModule),
  ],
  controllers: [UnitsController],
  providers: [UnitsService, RedisService],
  exports: [UnitsService, MongooseModule],
})
export class UnitsModule { }
