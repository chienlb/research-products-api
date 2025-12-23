import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PronunciationController } from './pronunciations.controller';
import { PronunciationService } from './pronunciations.service';
import {
  PronunciationExercise,
  PronunciationExerciseSchema,
} from './schema/pronunciation-exercise.schema';
import {
  PronunciationAttempt,
  PronunciationAttemptSchema,
} from './schema/pronunciation-attempt.schema';
import { CloudflareModule } from '../cloudflare/cloudflare.module';
import { UsersModule } from '../users/users.module';
import { LessonsModule } from '../lessons/lessons.module';
import { UnitsModule } from '../units/units.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PronunciationExercise.name, schema: PronunciationExerciseSchema },
      { name: PronunciationAttempt.name, schema: PronunciationAttemptSchema },
    ]),
    CloudflareModule,
    UsersModule,
    LessonsModule,
    UnitsModule,
  ],
  controllers: [PronunciationController],
  providers: [PronunciationService],
  exports: [PronunciationService],
})
export class PronunciationsModule { }
