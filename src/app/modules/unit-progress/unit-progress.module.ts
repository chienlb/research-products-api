import { Module, forwardRef } from '@nestjs/common';
import { UnitProgressService } from './unit-progress.service';
import { UnitProgressController } from './unit-progress.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UnitProgress, UnitProgressSchema } from './schema/unit-progress.schema';
import { UsersModule } from '../users/users.module';
import { UnitsModule } from '../units/units.module';
import { Unit, UnitSchema } from '../units/schema/unit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UnitProgress.name, schema: UnitProgressSchema }]),
    UsersModule,
    forwardRef(() => UnitsModule),
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
  ],
  controllers: [UnitProgressController],
  providers: [UnitProgressService],
  exports: [UnitProgressService, MongooseModule],
})
export class UnitProgressModule { }
