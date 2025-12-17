import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Lesson, LessonDocument, LessonStatus } from './schema/lesson.schema';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { UsersService } from '../users/users.service';
import { UnitsService } from '../units/units.service';
import { PaginationDto } from '../pagination/pagination.dto';
import { RedisService } from 'src/app/configs/redis/redis.service';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    private readonly usersService: UsersService,
    private readonly unitsService: UnitsService,
    private readonly redisService: RedisService,
  ) { }

  async createLesson(
    createLessonDto: CreateLessonDto,
    session?: ClientSession,
  ): Promise<LessonDocument> {
    const mongooseSession = session ?? (await this.lessonModel.startSession());
    const isNewSession = !session;

    if (isNewSession) {
      await mongooseSession.startTransaction();
    }
    try {
      const user = await this.usersService.findUserById(
        createLessonDto.createdBy,
      );
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const unit = await this.unitsService.findUnitById(createLessonDto.unit);
      if (!unit) {
        throw new NotFoundException('Unit not found');
      }
      const newLesson = new this.lessonModel({
        ...createLessonDto,
        createdBy: user._id,
        updatedBy: user._id,
        unit: unit._id,
      });
      await newLesson.save({ session: mongooseSession });
      await unit.lessons.push(newLesson._id);
      await unit.save({ session: mongooseSession });

      if (isNewSession) {
        await mongooseSession.commitTransaction();
      }

      return newLesson;
    } catch (error) {
      if (isNewSession) {
        await mongooseSession.abortTransaction();
      }
      throw new Error('Failed to create lesson: ' + error.message);
    } finally {
      if (isNewSession) {
        await mongooseSession.endSession();
      }
    }
  }

  async findLessonById(id: string): Promise<LessonDocument> {
    const lesson = await this.lessonModel.findById(id).exec();
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    return lesson as LessonDocument;
  }

  async findLessonsByUnitId(unitId: string): Promise<LessonDocument[]> {
    return this.lessonModel.find({ unit: unitId }).exec();
  }

  async findLessonsByUserId(userId: string): Promise<LessonDocument[]> {
    return this.lessonModel.find({ createdBy: userId }).exec();
  }

  async updateLesson(
    id: string,
    updateLessonDto: UpdateLessonDto,
    session?: ClientSession,
  ): Promise<LessonDocument> {
    const mongooseSession = session ?? (await this.lessonModel.startSession());
    const isNewSession = !session;

    if (isNewSession) {
      await mongooseSession.startTransaction();
    }
    try {
      const lesson = await this.findLessonById(id);
      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }
      const updatedLesson = await this.lessonModel
        .findByIdAndUpdate(id, updateLessonDto, { new: true, session: mongooseSession })
        .exec();
      if (!updatedLesson) {
        throw new NotFoundException('Lesson not found');
      }
      if (isNewSession) {
        await mongooseSession.commitTransaction();
      }

      return updatedLesson;
    } catch (error) {
      if (isNewSession) {
        await mongooseSession.abortTransaction();
      }
      throw new Error('Failed to update lesson: ' + error.message);
    } finally {
      if (isNewSession) {
        await mongooseSession.endSession();
      }
    }
  }

  async deleteLesson(id: string, session?: ClientSession): Promise<LessonDocument> {
    const mongooseSession = session ?? (await this.lessonModel.startSession());
    const isNewSession = !session;

    if (isNewSession) {
      await mongooseSession.startTransaction();
    }
    try {
      const lesson = await this.findLessonById(id);
      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }
      const unit = await this.unitsService.findUnitById(lesson.unit.toString());
      if (!unit) {
        throw new NotFoundException('Unit not found');
      }
      await lesson.updateOne({ isActive: LessonStatus.INACTIVE }, { session: mongooseSession });

      const lessonIndex = unit.lessons.findIndex(
        (l) => l.toString() === lesson._id.toString(),
      );
      if (lessonIndex !== -1) {
        unit.lessons.splice(lessonIndex, 1);
      }

      await unit.save({ session: mongooseSession });

      if (isNewSession) {
        await mongooseSession.commitTransaction();
      }

      return lesson;
    } catch (error) {
      if (isNewSession) {
        await mongooseSession.abortTransaction();
      }
      throw new Error('Failed to delete lesson: ' + error.message);
    } finally {
      if (isNewSession) {
        await mongooseSession.endSession();
      }
    }
  }

  async restoreLesson(id: string, session?: ClientSession): Promise<LessonDocument> {
    const mongooseSession = session ?? (await this.lessonModel.startSession());
    const isNewSession = !session;

    if (isNewSession) {
      await mongooseSession.startTransaction();
    }
    try {
      const lesson = await this.findLessonById(id);
      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }
      const unit = await this.unitsService.findUnitById(lesson.unit.toString());
      if (!unit) {
        throw new NotFoundException('Unit not found');
      }
      await lesson.updateOne({ isActive: LessonStatus.ACTIVE }, { session: mongooseSession });
      await unit.lessons.push(lesson._id);
      await unit.save({ session: mongooseSession });

      if (isNewSession) {
        await mongooseSession.commitTransaction();
      }

      return lesson;
    } catch (error) {
      if (isNewSession) {
        await mongooseSession.abortTransaction();
      }
      throw new Error('Failed to restore lesson: ' + error.message);
    } finally {
      if (isNewSession) {
        await mongooseSession.endSession();
      }
    }
  }

  async findAllLessons(
    paginationDto: PaginationDto,
  ): Promise<{
    data: LessonDocument[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    nextPage: number;
    prevPage: number;
  }> {
    try {
      const cacheKey = `lessons:page=${paginationDto.page}:limit=${paginationDto.limit}:sort=${paginationDto.sort}:order=${paginationDto.order}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const lessons = await this.lessonModel
        .find({ isActive: LessonStatus.ACTIVE })
        .skip((paginationDto.page - 1) * paginationDto.limit)
        .limit(paginationDto.limit)
        .sort({ [paginationDto.sort]: paginationDto.order === 'asc' ? 1 : -1 })
        .exec();
      const totalLessons = await this.lessonModel.countDocuments({
        isActive: LessonStatus.ACTIVE,
      });
      const result = {
        data: lessons as LessonDocument[],
        page: paginationDto.page,
        limit: paginationDto.limit,
        total: totalLessons,
        totalPages: Math.ceil(totalLessons / paginationDto.limit),
        nextPage:
          paginationDto.page < Math.ceil(totalLessons / paginationDto.limit)
            ? paginationDto.page + 1
            : paginationDto.page,
        prevPage:
          paginationDto.page > 1 ? paginationDto.page - 1 : paginationDto.page,
      };
      await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
      return result;
    } catch (error) {
      throw new Error('Failed to find all lessons: ' + error.message);
    }
  }
}
