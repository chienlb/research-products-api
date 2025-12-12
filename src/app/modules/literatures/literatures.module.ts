import { Module } from '@nestjs/common';
import { LiteraturesService } from './literatures.service';
import { LiteraturesController } from './literatures.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Literature, LiteratureSchema } from './schema/literature.schema';
import { UsersModule } from '../users/users.module';
import { RedisModule } from 'src/app/configs/redis/redis.module';
import { RedisService } from 'src/app/configs/redis/redis.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Literature.name, schema: LiteratureSchema },
    ]),
    UsersModule,
    RedisModule,
  ],
  controllers: [LiteraturesController],
  providers: [LiteraturesService, RedisService],
  exports: [LiteraturesService],
})
export class LiteraturesModule { }
