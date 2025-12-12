import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Literature, LiteratureDocument } from './schema/literature.schema';
import { CreateLiteratureDto } from './dto/create-literature.dto';
import { UpdateLiteratureDto } from './dto/update-literature.dto';
import { UsersService } from '../users/users.service';
import { PaginationDto } from '../pagination/pagination.dto';
import { RedisService } from 'src/app/configs/redis/redis.service';

@Injectable()
export class LiteraturesService {
  constructor(
    @InjectModel(Literature.name)
    private literatureModel: Model<LiteratureDocument>,
    private usersService: UsersService,
    private readonly redisService: RedisService,
  ) { }

  async createLiterature(
    createLiteratureDto: CreateLiteratureDto,
  ): Promise<LiteratureDocument> {
    try {
      const existingLiterature = await this.literatureModel.findOne({
        title: createLiteratureDto.title,
      });
      if (existingLiterature) {
        throw new BadRequestException('Literature already exists');
      }

      const user = await this.usersService.findUserById(
        createLiteratureDto.createdBy?.toString() || '',
      );
      if (user) {
        createLiteratureDto.createdBy = user._id;
        createLiteratureDto.updatedBy = user._id;
      }

      const createdLiterature =
        await this.literatureModel.create(createLiteratureDto);
      return createdLiterature;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getLiteratures(
    paginationDto: PaginationDto,
  ): Promise<{
    literatures: LiteratureDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  }> {
    try {
      const cacheKey = `literatures:page=${paginationDto.page}:limit=${paginationDto.limit}:sort=${paginationDto.sort}:order=${paginationDto.order}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const literatures = await this.literatureModel
        .find({ isActive: true })
        .skip((paginationDto.page - 1) * paginationDto.limit)
        .limit(paginationDto.limit)
        .sort({ [paginationDto.sort]: paginationDto.order === 'asc' ? 1 : -1 });
      const total = await this.literatureModel.countDocuments({ isActive: true });
      const totalPages = Math.ceil(total / paginationDto.limit);
      const currentPage = paginationDto.page;
      const hasNextPage = currentPage < totalPages;
      const hasPreviousPage = currentPage > 1;
      const nextPage = paginationDto.page < totalPages ? paginationDto.page + 1 : null;
      const prevPage = paginationDto.page > 1 ? paginationDto.page - 1 : null;
      const result = {
        literatures,
        total,
        totalPages,
        currentPage,
        hasNextPage,
        hasPreviousPage,
        nextPage,
        prevPage,
      };
      await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getLiteratureById(id: string): Promise<LiteratureDocument> {
    try {
      const cacheKey = `literature:id=${id}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const literature = await this.literatureModel.findById(id);
      if (!literature) {
        throw new BadRequestException('Literature not found');
      }
      const result = {
        data: literature,
      };
      await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
      return result.data;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateLiterature(
    id: string,
    updateLiteratureDto: UpdateLiteratureDto,
  ): Promise<LiteratureDocument> {
    try {
      const literature = await this.literatureModel.findByIdAndUpdate(
        id,
        updateLiteratureDto,
        { new: true },
      );
      if (!literature) {
        throw new BadRequestException('Literature not found');
      }
      return literature;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteLiterature(id: string): Promise<LiteratureDocument> {
    try {
      const literature = await this.literatureModel.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true },
      );
      if (!literature) {
        throw new BadRequestException('Literature not found');
      }
      return literature;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async restoreLiterature(id: string): Promise<LiteratureDocument> {
    try {
      const literature = await this.literatureModel.findByIdAndUpdate(
        id,
        { isDeleted: false },
        { new: true },
      );
      if (!literature) {
        throw new BadRequestException('Literature not found');
      }
      return literature;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async changeLiteratureStatus(
    id: string,
    status: boolean,
  ): Promise<LiteratureDocument> {
    try {
      const literature = await this.literatureModel.findByIdAndUpdate(
        id,
        { isPublished: status },
        { new: true },
      );
      if (!literature) {
        throw new BadRequestException('Literature not found');
      }
      return literature;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
