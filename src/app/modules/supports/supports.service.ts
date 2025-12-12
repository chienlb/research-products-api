import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Support,
  SupportDocument,
  SupportStatus,
} from './schema/support.schema';
import { CreateSupportDto } from './dto/create-support.dto';
import { UpdateSupportDto } from './dto/update-support.dto';
import { UsersService } from '../users/users.service';
import { NotFoundException } from '@nestjs/common';
import { CloudflareService } from '../cloudflare/cloudflare.service';
import { RedisService } from 'src/app/configs/redis/redis.service';

@Injectable()
export class SupportsService {
  constructor(
    @InjectModel(Support.name) private supportModel: Model<SupportDocument>,
    private readonly usersService: UsersService,
    private readonly cloudflareService: CloudflareService,
    private readonly redisService: RedisService,
  ) { }

  async createSupport(
    createSupportDto: CreateSupportDto,
  ): Promise<SupportDocument> {
    try {
      const user = await this.usersService.findUserById(
        createSupportDto.userId,
      );
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (createSupportDto.attachments) {
        const file = await this.cloudflareService.create({
          filename: createSupportDto.attachments[0],
          contentType: 'application/pdf',
        });
        createSupportDto.attachments = [file.fileUrl];
      }
      const support = new this.supportModel({
        ...createSupportDto,
        userId: user._id,
      });
      return support.save();
    } catch (error) {
      throw new Error('Failed to create support: ' + error.message);
    }
  }

  async updateSupport(
    id: string,
    updateSupportDto: UpdateSupportDto,
  ): Promise<SupportDocument> {
    try {
      const support = await this.supportModel.findByIdAndUpdate(
        id,
        updateSupportDto,
        { new: true },
      );
      if (!support) {
        throw new NotFoundException('Support not found');
      }
      return support;
    } catch (error) {
      throw new Error('Failed to update support: ' + error.message);
    }
  }

  async deleteSupport(id: string): Promise<void> {
    try {
      const support = await this.supportModel.findByIdAndDelete(id);
      if (!support) {
        throw new NotFoundException('Support not found');
      }
      return;
    } catch (error) {
      throw new Error('Failed to delete support: ' + error.message);
    }
  }

  async getSupportById(id: string): Promise<SupportDocument> {
    try {
      const cacheKey = `support:id=${id}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const support = await this.supportModel.findById(id);
      if (!support) {
        throw new NotFoundException('Support not found');
      }
      const result = {
        data: support,
      };
      await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
      return result.data;
    } catch (error) {
      throw new Error('Failed to get support: ' + error.message);
    }
  }

  async getSupports(): Promise<SupportDocument[]> {
    try {
      const cacheKey = `supports`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const supports = await this.supportModel.find();
      const result = {
        data: supports,
      };
      await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
      return result.data;
    } catch (error) {
      throw new Error('Failed to get supports: ' + error.message);
    }
  }

  async getSupportsByUserId(userId: string): Promise<SupportDocument[]> {
    try {
      const cacheKey = `supports:user-id=${userId}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const supports = await this.supportModel.find({ userId });
      const result = {
        data: supports,
      };
      await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
      return result.data;
    } catch (error) {
      throw new Error('Failed to get supports: ' + error.message);
    }
  }

  async getSupportsByStatus(status: SupportStatus): Promise<SupportDocument[]> {
    try {
      const supports = await this.supportModel.find({ status });
      return supports;
    } catch (error) {
      throw new Error('Failed to get supports: ' + error.message);
    }
  }
}
