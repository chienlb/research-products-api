import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group, GroupDocument, GroupType, GroupVisibility } from './schema/group.schema';
import { CreateGroupDto } from './dto/create-group.dto';
import { UsersService } from '../users/users.service';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PackageType } from '../packages/schema/package.schema';
import { PaginationDto } from '../pagination/pagination.dto';
import { RedisService } from 'src/app/configs/redis/redis.service';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name)
    private groupRepository: Model<Group>,
    private usersService: UsersService,
    private readonly redisService: RedisService,
  ) { }

  async createGroup(createGroupDto: CreateGroupDto): Promise<GroupDocument> {
    try {
      const user = await this.usersService.findUserById(createGroupDto.owner);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (createGroupDto.members && createGroupDto.members.length > 0) {
        const members = await Promise.all(
          createGroupDto.members.map(async (member) => {
            const user = await this.usersService.findUserById(member);
            if (!user) {
              throw new NotFoundException('User not found');
            }
            return user._id;
          }),
        );
        createGroupDto.members = members.map((member) => member.toString());
      }
      const typeOwner = user.accountPackage;
      if (typeOwner === PackageType.FREE) {
        createGroupDto.maxMembers = 10;
      }
      if (typeOwner === PackageType.STANDARD) {
        createGroupDto.maxMembers = 20;
      }
      if (typeOwner === PackageType.PREMIUM) {
        createGroupDto.maxMembers = 50;
      }
      if (typeOwner === PackageType.VIP) {
        createGroupDto.maxMembers = 100;
      }
      const newGroup = new this.groupRepository({
        ...createGroupDto,
        owner: user._id,
        members: createGroupDto.members,
        school: createGroupDto.school,
        classRef: createGroupDto.classRef,
        subject: createGroupDto.subject,
        maxMembers: createGroupDto.maxMembers,
        isActive: true,
        joinCode: createGroupDto.joinCode,
        avatar: createGroupDto.avatar,
        background: createGroupDto.background,
      });
      return await newGroup.save();
    } catch (error) {
      throw new Error('Failed to create group: ' + error.message);
    }
  }

  async findGroupById(id: string): Promise<GroupDocument> {
    const group = await this.groupRepository.findById(id);
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }

  async findGroupsByUserId(userId: string): Promise<GroupDocument[]> {
    const groups = await this.groupRepository.find({ members: userId });
    if (!groups) {
      throw new NotFoundException('Groups not found');
    }
    return groups;
  }

  async findGroupsBySchoolId(schoolId: string): Promise<GroupDocument[]> {
    const groups = await this.groupRepository.find({ school: schoolId });
    if (!groups) {
      throw new NotFoundException('Groups not found');
    }
    return groups;
  }

  async findGroupsByClassId(classId: string): Promise<GroupDocument[]> {
    const groups = await this.groupRepository.find({ classRef: classId });
    if (!groups) {
      throw new NotFoundException('Groups not found');
    }
    return groups;
  }

  async findAllGroups(
    paginationDto: PaginationDto,
  ): Promise<{
    data: GroupDocument[];
    total: number;
    totalPages: number;
    nextPage: number;
    prevPage: number;
  }> {
    try {
      const cacheKey = `groups:page=${paginationDto.page}:limit=${paginationDto.limit}:sort=${paginationDto.sort}:order=${paginationDto.order}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const groups = await this.groupRepository
        .find({ isActive: true })
        .skip((paginationDto.page - 1) * paginationDto.limit)
        .limit(paginationDto.limit)
        .sort({ [paginationDto.sort]: paginationDto.order === 'asc' ? 1 : -1 });
      const total = await this.groupRepository.countDocuments({ isActive: true });
      const totalPages = Math.ceil(total / paginationDto.limit);
      const nextPage = paginationDto.page < totalPages ? paginationDto.page + 1 : null;
      const prevPage = paginationDto.page > 1 ? paginationDto.page - 1 : null;
      const result = {
        data: groups as GroupDocument[],
        total,
        totalPages,
        nextPage: nextPage ?? paginationDto.page,
        prevPage: prevPage ?? paginationDto.page,
      };
      await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
      return result;
    } catch (error) {
      throw new Error('Failed to find all groups: ' + error.message);
    }
  }

  async updateGroup(id: string, updateGroupDto: UpdateGroupDto): Promise<GroupDocument> {
    try {
      const updatedGroup = await this.groupRepository.findByIdAndUpdate(
        new Types.ObjectId(id),
        updateGroupDto,
        { new: true, runValidators: true }
      );

      if (!updatedGroup) {
        throw new NotFoundException('Group not found');
      }

      return updatedGroup;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException('Invalid group ID');
      }

      throw new InternalServerErrorException('Failed to update group');
    }
  }

  async deleteGroup(id: string): Promise<GroupDocument> {
    try {
      const deletedGroup = await this.groupRepository.findByIdAndUpdate(
        new Types.ObjectId(id),
        { isActive: false },
        { new: true }
      );

      if (!deletedGroup) {
        throw new NotFoundException('Group not found');
      }

      return deletedGroup;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException('Invalid group ID');
      }

      throw new InternalServerErrorException('Failed to delete group');
    }
  }


  async joinGroup(groupId: string, userId: string): Promise<GroupDocument> {
    try {
      const group = await this.findGroupById(groupId);
      if (!group) {
        throw new NotFoundException('Group not found');
      }
      const user = await this.usersService.findUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (group.members.includes(user._id)) {
        throw new BadRequestException('User already in group');
      }
      group.members.push(user._id);
      return group.save();
    } catch (error) {
      throw new Error('Failed to join group: ' + error.message);
    }
  }

  async leaveGroup(groupId: string, userId: string): Promise<GroupDocument> {
    try {
      const group = await this.findGroupById(groupId);
      if (!group) {
        throw new NotFoundException('Group not found');
      }
      const user = await this.usersService.findUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (!group.members.includes(user._id)) {
        throw new BadRequestException('User not in group');
      }
      group.members.splice(group.members.indexOf(user._id), 1);
      return group.save();
    } catch (error) {
      throw new Error('Failed to leave group: ' + error.message);
    }
  }

  async restoreGroup(groupId: string): Promise<GroupDocument> {
    try {
      const group = await this.findGroupById(groupId);
      if (!group) {
        throw new NotFoundException('Group not found');
      }
      group.isActive = true;
      return group.save();
    } catch (error) {
      throw new Error('Failed to restore group: ' + error.message);
    }
  }

  async changeGroupVisibility(groupId: string, visibility: GroupVisibility): Promise<GroupDocument> {
    try {
      const group = await this.findGroupById(groupId);
      if (!group) {
        throw new NotFoundException('Group not found');
      }
      group.visibility = visibility;
      return group.save();
    } catch (error) {
      throw new Error('Failed to change group visibility: ' + error.message);
    }
  }
}
