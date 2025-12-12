import { Module } from '@nestjs/common';
import { GroupMessagesService } from './group-messages.service';
import { GroupMessagesController } from './group-messages.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  GroupMessage,
  GroupMessageSchema,
} from './schema/group-message.schema';
import { UsersModule } from '../users/users.module';
import { GroupsModule } from '../groups/groups.module';
import { RedisModule } from 'src/app/configs/redis/redis.module';
import { RedisService } from 'src/app/configs/redis/redis.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GroupMessage.name, schema: GroupMessageSchema },
    ]),
    UsersModule,
    GroupsModule,
    RedisModule,
  ],
  controllers: [GroupMessagesController],
  providers: [GroupMessagesService, RedisService],
  exports: [GroupMessagesService],
})
export class GroupMessagesModule { }
