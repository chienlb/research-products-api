import { Module } from '@nestjs/common';
import { LiteraturesService } from './literatures.service';
import { LiteraturesController } from './literatures.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Literature, LiteratureSchema } from './schema/literature.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Literature.name, schema: LiteratureSchema }]), UsersModule],
  controllers: [LiteraturesController],
  providers: [LiteraturesService],
  exports: [LiteraturesService],
})
export class LiteraturesModule { }
