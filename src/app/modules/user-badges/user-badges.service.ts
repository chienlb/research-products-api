import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserBadge, UserBadgeDocument } from './schema/user-badge.schema';
import { CreateUserBadgeDto } from './dto/create-user-badge.dto';
import { UsersService } from '../users/users.service';
import { BadgesService } from '../badges/badges.service';
import { UpdateUserBadgeDto } from './dto/update-user-badge.dto';
import { PaginationDto } from '../pagination/pagination.dto';
import { RedisService } from 'src/app/configs/redis/redis.service';

@Injectable()
export class UserBadgesService {
  constructor(
    @InjectModel(UserBadge.name)
    private userBadgeModel: Model<UserBadgeDocument>,
    private usersService: UsersService,
    private badgesService: BadgesService,
    private readonly redisService: RedisService,
  ) { }

  async createUserBadge(
    createUserBadgeDto: CreateUserBadgeDto,
  ): Promise<UserBadgeDocument> {
    try {
      const user = await this.usersService.findUserById(
        createUserBadgeDto.userId,
      );
      if (!user) {
        throw new BadRequestException('User not found');
      }
      const badge = await this.badgesService.findBadgeById(
        createUserBadgeDto.badgeId,
      );
      if (!badge) {
        throw new BadRequestException('Badge not found');
      }
      const userBadge = new this.userBadgeModel(createUserBadgeDto);
      return await userBadge.save();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findUserBadgeById(id: string): Promise<UserBadgeDocument> {
    try {
      const cacheKey = `user-badge:id=${id}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const userBadge = await this.userBadgeModel.findById(id);
      if (!userBadge) {
        throw new BadRequestException('User badge not found');
      }
      const result = {
        data: userBadge,
      };
      await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
      return result.data;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAllUserBadges(paginationDto: PaginationDto): Promise<{
    userBadges: UserBadgeDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPage: number | null;
    previousPage: number | null;
  }> {
    try {
      const cacheKey = `user-badges:page=${paginationDto.page}:limit=${paginationDto.limit}:sort=${paginationDto.sort}:order=${paginationDto.order}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const userBadges = await this.userBadgeModel
        .find()
        .skip((paginationDto.page - 1) * paginationDto.limit)
        .limit(paginationDto.limit)
        .sort(paginationDto.sort)
        .exec();
      const total = await this.userBadgeModel.countDocuments();
      const totalPages = Math.ceil(total / paginationDto.limit);
      const currentPage = paginationDto.page;
      const hasNextPage = paginationDto.page < totalPages;
      const hasPreviousPage = paginationDto.page > 1;
      const nextPage = hasNextPage ? paginationDto.page + 1 : null;
      const previousPage = hasPreviousPage ? paginationDto.page - 1 : null;
      const result = {
        userBadges,
        total,
        totalPages,
        currentPage,
        hasNextPage,
        hasPreviousPage,
        nextPage,
        previousPage,
      };
      await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateUserBadge(
    id: string,
    updateUserBadgeDto: UpdateUserBadgeDto,
  ): Promise<UserBadgeDocument> {
    try {
      const userBadge = await this.userBadgeModel.findByIdAndUpdate(
        id,
        updateUserBadgeDto,
        { new: true },
      );
      if (!userBadge) {
        throw new BadRequestException('User badge not found');
      }
      return userBadge;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteUserBadge(id: string): Promise<void> {
    try {
      const userBadge = await this.userBadgeModel.findByIdAndDelete(id);
      if (!userBadge) {
        throw new BadRequestException('User badge not found');
      }
    } catch (error) {
      throw new BadRequestException('Failed to delete user badge', error);
    }
  }

  async revokeUserBadge(id: string): Promise<void> {
    try {
      const userBadge = await this.userBadgeModel.findByIdAndUpdate(
        id,
        { isRevoked: true },
        { new: true },
      );
      if (!userBadge) {
        throw new BadRequestException('User badge not found');
      }
    } catch (error) {
      throw new BadRequestException('Failed to revoke user badge', error);
    }
  }

  async restoreUserBadge(id: string): Promise<void> {
    try {
      const userBadge = await this.userBadgeModel.findByIdAndUpdate(
        id,
        { isRevoked: false },
        { new: true },
      );
      if (!userBadge) {
        throw new BadRequestException('User badge not found');
      }
    } catch (error) {
      throw new BadRequestException('Failed to restore user badge', error);
    }
  }

  async findUserBadgesByUserId(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    userBadges: UserBadgeDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPage: number | null;
    previousPage: number | null;
  }> {
    try {
      const cacheKey = `user-badges:user-id=${userId}:page=${paginationDto.page}:limit=${paginationDto.limit}:sort=${paginationDto.sort}:order=${paginationDto.order}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const userBadges = await this.userBadgeModel
        .find({ userId })
        .skip((paginationDto.page - 1) * paginationDto.limit)
        .limit(paginationDto.limit)
        .sort({ [paginationDto.sort]: paginationDto.order === 'asc' ? 1 : -1 })
        .sort({ createdAt: 'desc' })
        .exec();
      const total = await this.userBadgeModel.countDocuments({ userId });
      const totalPages = Math.ceil(total / paginationDto.limit);
      const currentPage = paginationDto.page;
      const hasNextPage = paginationDto.page < totalPages;
      const hasPreviousPage = paginationDto.page > 1;
      const nextPage = hasNextPage ? paginationDto.page + 1 : null;
      const previousPage = hasPreviousPage ? paginationDto.page - 1 : null;
      const result = {
        userBadges,
        total,
        totalPages,
        currentPage,
        hasNextPage,
        hasPreviousPage,
        nextPage,
        previousPage,
      };
      await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
      return result;
    } catch (error) {
      throw new BadRequestException('Failed to find user badges', error);
    }
  }
}
