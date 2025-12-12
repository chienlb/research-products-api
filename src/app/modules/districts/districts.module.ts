import { Module } from '@nestjs/common';
import { DistrictsService } from './districts.service';
import { DistrictsController } from './districts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { District, DistrictSchema } from './schema/district.schema';
import { RedisModule } from 'src/app/configs/redis/redis.module';
import { RedisService } from 'src/app/configs/redis/redis.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: District.name, schema: DistrictSchema },
    ]),
    RedisModule,
  ],
  controllers: [DistrictsController],
  providers: [DistrictsService, RedisService],
  exports: [DistrictsService, MongooseModule],
})
export class DistrictsModule { }
