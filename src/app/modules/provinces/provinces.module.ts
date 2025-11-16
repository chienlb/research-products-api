import { Module } from '@nestjs/common';
import { ProvincesService } from './provinces.service';
import { ProvincesController } from './provinces.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Province, ProvinceSchema } from './schema/province.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Province.name, schema: ProvinceSchema },
    ]),
  ],
  controllers: [ProvincesController],
  providers: [ProvincesService],
  exports: [ProvincesService, MongooseModule],
})
export class ProvincesModule { }
