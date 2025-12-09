import { Module } from '@nestjs/common';
import { ProgressesService } from './progresses.service';
import { ProgressesController } from './progresses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Progress, ProgressSchema } from './schema/progress.schema';
import { LessonsModule } from '../lessons/lessons.module';
import { AssignmentsModule } from '../assignments/assignments.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Progress.name, schema: ProgressSchema }]),
    LessonsModule,
    AssignmentsModule,
    UsersModule,
  ],
  controllers: [ProgressesController],
  providers: [ProgressesService, ],
  exports: [ProgressesService, MongooseModule],
})
export class ProgressesModule {}
