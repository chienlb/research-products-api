import { Injectable, Inject, NotFoundException, InternalServerErrorException, forwardRef, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Lesson, LessonDocument, LessonStatus } from './schema/lesson.schema';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { UsersService } from '../users/users.service';
import { UnitsService } from '../units/units.service';
import { PaginationDto } from '../pagination/pagination.dto';
import { RedisService } from 'src/app/configs/redis/redis.service';
import { LessonProgressService } from '../lesson-progress/lesson-progress.service';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    private readonly usersService: UsersService,
    private readonly unitsService: UnitsService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => LessonProgressService)) private readonly lessonProgressService: LessonProgressService,
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
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create lesson: ' + error.message);
    } finally {
      if (isNewSession) {
        await mongooseSession.endSession();
      }
    }
  }

  async findLessonById(id: string, session?: ClientSession): Promise<LessonDocument> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid lesson ID format');
      }
      const lesson = await this.lessonModel
        .findById(id)
        .session(session || null)
        .exec();
      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }
      return lesson as LessonDocument;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to find lesson by ID: ' + error.message);
    }
  }

  async findLessonsByUnitId(unitId: string, session?: ClientSession): Promise<LessonDocument[]> {
    try {
      if (!Types.ObjectId.isValid(unitId)) {
        throw new BadRequestException('Invalid unit ID format');
      }
      return this.lessonModel
        .find({ unit: unitId, isActive: LessonStatus.ACTIVE })
        .sort({ orderIndex: 1 })
        .session(session || null)
        .exec();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to find lessons by unit ID: ' + error.message);
    }
  }

  async findLessonsByUserId(userId: string, session?: ClientSession): Promise<LessonDocument[]> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID format');
      }
      return this.lessonModel
        .find({ createdBy: userId, isActive: LessonStatus.ACTIVE })
        .sort({ createdAt: -1 })
        .session(session || null)
        .exec();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to find lessons by user ID: ' + error.message);
    }
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
      const lesson = await this.findLessonById(id, mongooseSession);
      
      // Validate updatedBy if provided
      if (updateLessonDto.updatedBy) {
        const user = await this.usersService.findUserById(updateLessonDto.updatedBy);
        if (!user) {
          throw new NotFoundException('User not found');
        }
      }

      const updatedLesson = await this.lessonModel
        .findByIdAndUpdate(
          id,
          updateLessonDto,
          { new: true, runValidators: true, session: mongooseSession }
        )
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
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update lesson: ' + error.message);
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
      const lesson = await this.findLessonById(id, mongooseSession);
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
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete lesson: ' + error.message);
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
      const lesson = await this.findLessonById(id, mongooseSession);
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
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to restore lesson: ' + error.message);
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
      throw new InternalServerErrorException('Failed to find all lessons: ' + error.message);
    }
  }

  async getLessonByOrderIndex(orderIndex: number, unitId?: string): Promise<LessonDocument> {
    try {
      const query: any = { orderIndex, isActive: LessonStatus.ACTIVE };
      if (unitId) {
        if (!Types.ObjectId.isValid(unitId)) {
          throw new BadRequestException('Invalid unit ID format');
        }
        query.unit = unitId;
      }
      
      const lesson = await this.lessonModel.findOne(query).exec();
      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }
      return lesson as LessonDocument;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get lesson by order index: ' + error.message);
    }
  }

  async getLessonByOrderIndexAndUnitId(orderIndex: number, unitId: string, userId?: string): Promise<LessonDocument> {
    try {
      if (!Types.ObjectId.isValid(unitId)) {
        throw new BadRequestException('Invalid unit ID format');
      }
      
      const unit = await this.unitsService.findUnitById(unitId);
      if (!unit) {
        throw new NotFoundException('Unit not found');
      }
      
      // Optional: Check lesson progress if userId provided
      if (userId) {
        if (!Types.ObjectId.isValid(userId)) {
          throw new BadRequestException('Invalid user ID format');
        }
        const lessonProgress = await this.lessonProgressService.getLessonByUserId(userId, unitId, orderIndex - 1);
        if (!lessonProgress) {
          throw new NotFoundException('Lesson progress not found');
        }
      }
      
      const lesson = await this.lessonModel
        .findOne({ 
          orderIndex, 
          unit: unitId, 
          isActive: LessonStatus.ACTIVE 
        })
        .exec();
      
      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }
      return lesson as LessonDocument;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get lesson by order index and unit id: ' + error.message);
    }
  }
}
