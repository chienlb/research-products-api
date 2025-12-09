import { Module } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CompetitionsController } from './competitions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Competition, CompetitionSchema } from './schema/competition.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Competition.name, schema: CompetitionSchema }]),
    UsersModule,
  ],
  controllers: [CompetitionsController],
  providers: [CompetitionsService],
  exports: [CompetitionsService, MongooseModule],
})
export class CompetitionsModule {}
