import { Module } from '@nestjs/common';
import { ProgressesService } from './progresses.service';
import { ProgressesController } from './progresses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Progress, ProgressSchema } from './schema/progress.schema';
import { LessonsModule } from '../lessons/lessons.module';
import { AssignmentsModule } from '../assignments/assignments.module';
import { UsersModule } from '../users/users.module';
import { RedisModule } from 'src/app/configs/redis/redis.module';
import { RedisService } from 'src/app/configs/redis/redis.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Progress.name, schema: ProgressSchema }]),
    LessonsModule,
    AssignmentsModule,
    UsersModule,
    RedisModule,
  ],
  controllers: [ProgressesController],
  providers: [ProgressesService, RedisService],
  exports: [ProgressesService, MongooseModule],
})
export class ProgressesModule { }
