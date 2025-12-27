import { Module, forwardRef } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Lesson, LessonSchema } from './schema/lesson.schema';
import { UsersModule } from '../users/users.module';
import { UnitsModule } from '../units/units.module';
import { RedisModule } from 'src/app/configs/redis/redis.module';
import { RedisService } from 'src/app/configs/redis/redis.service';
import { LessonProgressModule } from '../lesson-progress/lesson-progress.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lesson.name, schema: LessonSchema },
    ]),
    UsersModule,
    UnitsModule,
    RedisModule,
    forwardRef(() => LessonProgressModule),
  ],
  controllers: [LessonsController],
  providers: [LessonsService, RedisService],
  exports: [LessonsService, MongooseModule],
})
export class LessonsModule { }
