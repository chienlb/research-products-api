import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './schema/group.schema';
import { UsersModule } from '../users/users.module';
import { RedisModule } from 'src/app/configs/redis/redis.module';
import { RedisService } from 'src/app/configs/redis/redis.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]), UsersModule, RedisModule],
  controllers: [GroupsController],
  providers: [GroupsService, RedisService],
  exports: [GroupsService],
})
export class GroupsModule { }
