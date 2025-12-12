import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Province, ProvinceDocument } from './schema/province.schema';
import { CreateProvinceDto } from './dto/create-province.dto';
import { UpdateProvinceDto } from './dto/update-province.dto';
import { NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../pagination/pagination.dto';
import { RedisService } from 'src/app/configs/redis/redis.service';

@Injectable()
export class ProvincesService {
  constructor(
    @InjectModel(Province.name) private provinceModel: Model<ProvinceDocument>,
    private readonly redisService: RedisService,
  ) { }

  async createProvince(
    createProvinceDto: CreateProvinceDto,
  ): Promise<ProvinceDocument> {
    const newProvince = new this.provinceModel(createProvinceDto);
    return await newProvince.save();
  }

  async findAllProvinces(
    paginationDto: PaginationDto,
  ): Promise<{
    data: ProvinceDocument[];
    total: number;
    totalPages: number;
    nextPage: number;
    prevPage: number;
  }> {
    try {
      const cacheKey = `provinces:page=${paginationDto.page}:limit=${paginationDto.limit}:sort=${paginationDto.sort}:order=${paginationDto.order}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const skip = (paginationDto.page - 1) * paginationDto.limit;
      const provinces = await this.provinceModel
        .find({ isActive: true })
        .skip(skip)
        .limit(paginationDto.limit)
        .sort({ [paginationDto.sort]: paginationDto.order === 'asc' ? 1 : -1 })
        .exec();
      const total = await this.provinceModel.countDocuments({ isActive: true });
      const totalPages = Math.ceil(total / paginationDto.limit);
      const nextPage =
        paginationDto.page < totalPages ? paginationDto.page + 1 : null;
      const prevPage = paginationDto.page > 1 ? paginationDto.page - 1 : null;
      const result = {
        data: provinces,
        total,
        totalPages,
        nextPage: nextPage ?? paginationDto.page,
        prevPage: prevPage ?? paginationDto.page,
      };
      await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
      return result;
    } catch (error) {
      throw new Error('Failed to find all provinces: ' + error.message);
    }
  }

  async findProvinceById(id: string): Promise<ProvinceDocument> {
    const cacheKey = `province:id=${id}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    const province = await this.provinceModel.findOne({ provinceId: id });
    if (!province) {
      throw new NotFoundException('Province not found');
    }
    const result = {
      data: province,
    };
    await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
    return result.data;
  }

  async updateProvince(
    id: string,
    updateProvinceDto: UpdateProvinceDto,
  ): Promise<ProvinceDocument> {
    try {
      const updatedProvince = await this.provinceModel.findOneAndUpdate(
        { provinceId: id },
        updateProvinceDto,
        { new: true },
      );
      if (!updatedProvince) {
        throw new NotFoundException('Province not found');
      }
      return updatedProvince;
    } catch (error) {
      throw new Error('Failed to update province: ' + error.message);
    }
  }

  async deleteProvince(id: string): Promise<ProvinceDocument> {
    try {
      const deletedProvince = await this.provinceModel.findOneAndDelete({
        provinceId: id,
      });
      if (!deletedProvince) {
        throw new NotFoundException('Province not found');
      }
      return deletedProvince;
    } catch (error) {
      throw new Error('Failed to delete province: ' + error.message);
    }
  }
}
