import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { School, SchoolDocument } from './schema/school.schema';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../pagination/pagination.dto';
import { RedisService } from 'src/app/configs/redis/redis.service';

@Injectable()
export class SchoolsService {
  constructor(
    @InjectModel(School.name) private schoolModel: Model<SchoolDocument>,
    private readonly redisService: RedisService,
  ) { }

  async createSchool(
    createSchoolDto: CreateSchoolDto,
    session?: ClientSession,
  ): Promise<SchoolDocument> {
    const mongooseSession = session ?? (await this.schoolModel.startSession());
    const isNewSession = !session;

    if (isNewSession) {
      await mongooseSession.startTransaction();
    }
    try {
      const newSchool = new this.schoolModel(createSchoolDto);
      await newSchool.save({ session: mongooseSession });

      if (isNewSession) {
        await mongooseSession.commitTransaction();
      }

      return newSchool;
    } catch (error) {
      if (isNewSession) {
        await mongooseSession.abortTransaction();
      }
      throw new Error('Failed to create school: ' + error.message);
    } finally {
      if (isNewSession) {
        await mongooseSession.endSession();
      }
    }
  }

  async findAllSchools(
    paginationDto: PaginationDto,
  ): Promise<{
    data: SchoolDocument[];
    total: number;
    totalPages: number;
    nextPage: number;
    prevPage: number;
  }> {
    const cacheKey = `schools:page=${paginationDto.page}:limit=${paginationDto.limit}:sort=${paginationDto.sort}:order=${paginationDto.order}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    const skip = (paginationDto.page - 1) * paginationDto.limit;
    const schools = await this.schoolModel
      .find({ isActive: true })
      .skip(skip)
      .limit(paginationDto.limit)
      .sort({ [paginationDto.sort]: paginationDto.order === 'asc' ? 1 : -1 })
      .exec();
    const total = await this.schoolModel.countDocuments({ isActive: true });
    const totalPages = Math.ceil(total / paginationDto.limit);
    const nextPage =
      paginationDto.page < totalPages ? paginationDto.page + 1 : null;
    const prevPage = paginationDto.page > 1 ? paginationDto.page - 1 : null;
    const result = {
      data: schools,
      total,
      totalPages,
      nextPage: nextPage ?? paginationDto.page,
      prevPage: prevPage ?? paginationDto.page,
    };
    await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
    return result;
  }

  async findSchoolById(id: string): Promise<SchoolDocument> {
    const cacheKey = `school:id=${id}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    const school = await this.schoolModel.findOne({ schoolId: id });
    if (!school) {
      throw new NotFoundException('School not found');
    }
    const result = {
      data: school,
    };
    await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
    return result.data;
  }

  async updateSchool(
    id: string,
    updateSchoolDto: UpdateSchoolDto,
    session?: ClientSession,
  ): Promise<SchoolDocument> {
    const mongooseSession = session ?? (await this.schoolModel.startSession());
    const isNewSession = !session;

    if (isNewSession) {
      await mongooseSession.startTransaction();
    }
    try {
      const school = await this.findSchoolById(id);
      if (!school) {
        throw new NotFoundException('School not found');
      }
      const updatedSchool = await this.schoolModel.findOneAndUpdate(
        { schoolId: id },
        updateSchoolDto,
        { new: true, session: mongooseSession },
      );

      if (!updatedSchool) {
        throw new NotFoundException('School not found');
      }
      if (isNewSession) {
        await mongooseSession.commitTransaction();
      }

      return updatedSchool;
    } catch (error) {
      if (isNewSession) {
        await mongooseSession.abortTransaction();
      }
      throw new Error('Failed to update school: ' + error.message);
    } finally {
      if (isNewSession) {
        await mongooseSession.endSession();
      }
    }
  }

  async deleteSchool(id: string, session?: ClientSession): Promise<SchoolDocument> {
    const mongooseSession = session ?? (await this.schoolModel.startSession());
    const isNewSession = !session;

    if (isNewSession) {
      await mongooseSession.startTransaction();
    }
    try {
      const school = await this.findSchoolById(id);
      if (!school) {
        throw new NotFoundException('School not found');
      }
      const deletedSchool = await this.schoolModel.findOneAndDelete(
        { schoolId: id },
        { session: mongooseSession },
      );
      if (!deletedSchool) {
        throw new NotFoundException('School not found');
      }
      if (isNewSession) {
        await mongooseSession.commitTransaction();
      }

      return deletedSchool;
    } catch (error) {
      if (isNewSession) {
        await mongooseSession.abortTransaction();
      }
      throw new Error('Failed to delete school: ' + error.message);
    } finally {
      if (isNewSession) {
        await mongooseSession.endSession();
      }
    }
  }
}
