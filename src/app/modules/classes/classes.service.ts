import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Class, ClassDocument } from './schema/class.schema';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../pagination/pagination.dto';
import { RedisService } from 'src/app/configs/redis/redis.service';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
    private readonly redisService: RedisService,
  ) { }

  async createClass(createClassDto: CreateClassDto): Promise<ClassDocument> {
    try {
      const newClass = new this.classModel(createClassDto);
      await newClass.save();
      return newClass;
    } catch (error) {
      throw new Error('Failed to create class: ' + error.message);
    }
  }

  async findAllClasses(
    paginationDto: PaginationDto,
  ): Promise<{
    data: ClassDocument[];
    total: number;
    totalPages: number;
    nextPage: number;
    prevPage: number;
  }> {
    const skip = (paginationDto.page - 1) * paginationDto.limit;
    const cacheKey = `classes:page=${paginationDto.page}:limit=${paginationDto.limit}:sort=${paginationDto.sort}:order=${paginationDto.order}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    const classes = await this.classModel
      .find({ isActive: true })
      .skip(skip)
      .limit(paginationDto.limit)
      .sort({ [paginationDto.sort]: paginationDto.order === 'asc' ? 1 : -1 })
      .exec();
    const total = await this.classModel.countDocuments({ isActive: true });
    const totalPages = Math.ceil(total / paginationDto.limit);
    const nextPage =
      paginationDto.page < totalPages ? paginationDto.page + 1 : null;
    const prevPage = paginationDto.page > 1 ? paginationDto.page - 1 : null;
    const result = {
      data: classes,
      total,
      totalPages,
      nextPage: nextPage ?? paginationDto.page,
      prevPage: prevPage ?? paginationDto.page,
    };
    await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
    return result;
  }

  async findClassById(id: string): Promise<ClassDocument> {
    const classResult = await this.classModel.findOne({ classId: id });
    if (!classResult) {
      throw new NotFoundException('Class not found');
    }
    return classResult;
  }

  async updateClass(
    id: string,
    updateClassDto: UpdateClassDto,
  ): Promise<ClassDocument> {
    try {
      const classResult = await this.findClassById(id);
      if (!classResult) {
        throw new NotFoundException('Class not found');
      }
      const updatedClass = await this.classModel.findOneAndUpdate(
        { classId: id },
        updateClassDto,
        { new: true },
      );
      if (!updatedClass) {
        throw new NotFoundException('Class not found');
      }
      return updatedClass;
    } catch (error) {
      throw new Error('Failed to update class: ' + error.message);
    }
  }

  async deleteClass(id: string): Promise<ClassDocument> {
    try {
      const classResult = await this.findClassById(id);
      if (!classResult) {
        throw new NotFoundException('Class not found');
      }
      const deletedClass = await this.classModel.findOneAndDelete({
        classId: id,
      });
      if (!deletedClass) {
        throw new NotFoundException('Class not found');
      }
      return deletedClass;
    } catch (error) {
      throw new Error('Failed to delete class: ' + error.message);
    }
  }
}
