import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Badge, BadgeDocument } from './schema/badge.schema';
import { UsersService } from '../users/users.service';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';
import { RedisService } from 'src/app/configs/redis/redis.service';

@Injectable()
export class BadgesService {
  constructor(
    @InjectModel(Badge.name) private badgeModel: Model<BadgeDocument>,
    private usersService: UsersService,
    private readonly redisService: RedisService,
  ) { }

  async createBadge(createBadgeDto: CreateBadgeDto): Promise<BadgeDocument> {
    try {
      const existingBadge = await this.badgeModel.findOne({
        name: createBadgeDto.name,
      });
      if (existingBadge) {
        throw new BadRequestException('Badge already exists');
      }

      const user = await this.usersService.findUserById(
        createBadgeDto.createdBy?.toString() || '',
      );
      if (!user) {
        throw new BadRequestException('User not found');
      }

      createBadgeDto.createdBy = user._id;
      createBadgeDto.updatedBy = user._id;

      return await this.badgeModel.create(createBadgeDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAllBadges(
    page: number,
    limit: number,
  ): Promise<{
    badges: BadgeDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPage: number | null;
    previousPage: number | null;
  }> {
    try {
      const cacheKey = `badges:page=${page}:limit=${limit}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const skip = (page - 1) * limit;
      const badges = await this.badgeModel.find().skip(skip).limit(limit);
      const total = await this.badgeModel.countDocuments();
      const totalPages = Math.ceil(total / limit);
      const currentPage = page;
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;
      const nextPage = hasNextPage ? page + 1 : null;
      const previousPage = hasPreviousPage ? page - 1 : null;
      const result = {
        badges,
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

  async findBadgeById(id: string): Promise<BadgeDocument> {
    try {
      const badge = await this.badgeModel.findById(id);
      if (!badge) {
        throw new BadRequestException('Badge not found');
      }
      return badge;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateBadgeById(
    id: string,
    updateBadgeDto: UpdateBadgeDto,
  ): Promise<BadgeDocument> {
    try {
      const badge = await this.badgeModel.findByIdAndUpdate(
        id,
        updateBadgeDto,
        { new: true },
      );
      if (!badge) {
        throw new BadRequestException('Badge not found');
      }
      return badge;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteBadgeById(id: string): Promise<BadgeDocument> {
    try {
      const badge = await this.badgeModel.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true },
      );
      if (!badge) {
        throw new BadRequestException('Badge not found');
      }
      return badge;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async restoreBadgeById(id: string): Promise<BadgeDocument> {
    try {
      const badge = await this.badgeModel.findByIdAndUpdate(
        id,
        { isActive: true },
        { new: true },
      );
      if (!badge) {
        throw new BadRequestException('Badge not found');
      }
      return badge;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
