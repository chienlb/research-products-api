import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Progress,
  ProgressDocument,
  ProgressStatus,
  ProgressType,
} from './schema/progress.schema';
import { Model } from 'mongoose';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { AssignmentsService } from '../assignments/assignments.service';
import { LessonsService } from '../lessons/lessons.service';
import { UsersService } from '../users/users.service';
import { PaginationDto } from '../pagination/pagination.dto';
import { RedisService } from 'src/app/configs/redis/redis.service';

@Injectable()
export class ProgressesService {
  constructor(
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    private readonly lessonsService: LessonsService,
    private readonly assignmentsService: AssignmentsService,
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
  ) { }

  async createProgress(
    createProgressDto: CreateProgressDto,
  ): Promise<ProgressDocument> {
    try {
      const existingProgress = await this.progressModel.findOne({
        userId: createProgressDto.userId,
        type: createProgressDto.type,
        courseId: createProgressDto.courseId,
        lessonId: createProgressDto.lessonId,
        assignmentId: createProgressDto.assignmentId,
      });
      if (existingProgress) {
        throw new BadRequestException('Progress already exists');
      }
      if (createProgressDto.type === ProgressType.LESSON) {
        const lesson = await this.lessonsService.findLessonById(
          createProgressDto.lessonId as string,
        );
        if (!lesson) {
          throw new BadRequestException('Lesson not found');
        }
      }
      if (createProgressDto.type === ProgressType.ASSIGNMENT) {
        const assignment = await this.assignmentsService.getAssignmentById(
          createProgressDto.assignmentId as string,
        );
        if (!assignment) {
          throw new BadRequestException('Assignment not found');
        }
      }

      const user = await this.usersService.findUserById(
        createProgressDto.userId as string,
      );
      if (!user) {
        throw new BadRequestException('User not found');
      }
      const progress = await this.progressModel.create(createProgressDto);
      return progress;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateProgress(
    updateProgressDto: UpdateProgressDto,
  ): Promise<ProgressDocument> {
    try {
      const progress = await this.progressModel.findOneAndUpdate(
        {
          userId: updateProgressDto.userId,
          type: updateProgressDto.type,
          courseId: updateProgressDto.courseId,
          lessonId: updateProgressDto.lessonId,
          assignmentId: updateProgressDto.assignmentId,
        },
        updateProgressDto,
        { new: true },
      );
      if (!progress) {
        throw new BadRequestException('Progress not found');
      }
      return progress;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async deleteProgress(
    deleteProgressDto: UpdateProgressDto,
  ): Promise<ProgressDocument> {
    try {
      const progress = await this.progressModel.findOneAndDelete({
        userId: deleteProgressDto.userId,
        type: deleteProgressDto.type,
        courseId: deleteProgressDto.courseId,
        lessonId: deleteProgressDto.lessonId,
        assignmentId: deleteProgressDto.assignmentId,
        status: ProgressStatus.NOT_STARTED,
      });
      if (!progress) {
        throw new BadRequestException('Progress not found');
      }
      return progress;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getProgressByUserId(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    data: ProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    try {
      const cacheKey = `progresses:user-id=${userId}:page=${paginationDto.page}:limit=${paginationDto.limit}:sort=${paginationDto.sort}:order=${paginationDto.order}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const progress = await this.progressModel
        .find({ userId: userId })
        .skip((paginationDto.page - 1) * paginationDto.limit)
        .limit(paginationDto.limit)
        .sort({ [paginationDto.sort]: paginationDto.order === 'asc' ? 1 : -1 });
      const total = await this.progressModel.countDocuments({ userId: userId });
      const totalPages = Math.ceil(total / paginationDto.limit);
      const currentPage = Math.max(1, Math.min(paginationDto.page, totalPages));
      const result = {
        data: progress,
        total: total,
        totalPages: totalPages,
        currentPage: currentPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        limit: paginationDto.limit,
      };
      await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
      return result;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getProgressByCourseId(
    courseId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    data: ProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    try {
      const cacheKey = `progresses:course-id=${courseId}:page=${paginationDto.page}:limit=${paginationDto.limit}:sort=${paginationDto.sort}:order=${paginationDto.order}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const progress = await this.progressModel
        .find({ courseId: courseId })
        .skip((paginationDto.page - 1) * paginationDto.limit)
        .limit(paginationDto.limit);
      const total = await this.progressModel.countDocuments({
        courseId: courseId,
      });
      const totalPages = Math.ceil(total / paginationDto.limit);
      const currentPage = Math.max(1, Math.min(paginationDto.page, totalPages));
      const result = {
        data: progress,
        total: total,
        totalPages: totalPages,
        currentPage: currentPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        limit: paginationDto.limit,
      };
      await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
      return result;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getProgressByLessonId(
    lessonId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    data: ProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    try {
      const cacheKey = `progresses:lesson-id=${lessonId}:page=${paginationDto.page}:limit=${paginationDto.limit}:sort=${paginationDto.sort}:order=${paginationDto.order}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const progress = await this.progressModel
        .find({ lessonId: lessonId })
        .skip((paginationDto.page - 1) * paginationDto.limit)
        .limit(paginationDto.limit);
      const total = await this.progressModel.countDocuments({
        lessonId: lessonId,
      });
      const totalPages = Math.ceil(total / paginationDto.limit);
      const currentPage = Math.max(1, Math.min(paginationDto.page, totalPages));
      const result = {
        data: progress,
        total: total,
        totalPages: totalPages,
        currentPage: currentPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        limit: paginationDto.limit,
      };
      await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
      return result;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getProgressByAssignmentId(
    assignmentId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    data: ProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    try {
      const cacheKey = `progresses:assignment-id=${assignmentId}:page=${paginationDto.page}:limit=${paginationDto.limit}:sort=${paginationDto.sort}:order=${paginationDto.order}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const progress = await this.progressModel
        .find({ assignmentId: assignmentId })
        .skip((paginationDto.page - 1) * paginationDto.limit)
        .limit(paginationDto.limit);
      const total = await this.progressModel.countDocuments({
        assignmentId: assignmentId,
      });
      const totalPages = Math.ceil(total / paginationDto.limit);
      const currentPage = Math.max(1, Math.min(paginationDto.page, totalPages));
      const result = {
        data: progress,
        total: total,
        totalPages: totalPages,
        currentPage: currentPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        limit: paginationDto.limit,
      };
      await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
      return result;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getProgressByUserIdAndCourseId(
    userId: string,
    courseId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    data: ProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    try {
      const cacheKey = `progresses:user-id=${userId}&course-id=${courseId}:page=${paginationDto.page}:limit=${paginationDto.limit}:sort=${paginationDto.sort}:order=${paginationDto.order}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const progress = await this.progressModel
        .find({ userId: userId, courseId: courseId })
        .skip((paginationDto.page - 1) * paginationDto.limit)
        .limit(paginationDto.limit);
      const total = await this.progressModel.countDocuments({
        userId: userId,
        courseId: courseId,
      });
      const totalPages = Math.ceil(total / paginationDto.limit);
      const currentPage = Math.max(1, Math.min(paginationDto.page, totalPages));
      const result = {
        data: progress,
        total: total,
        totalPages: totalPages,
        currentPage: currentPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        limit: paginationDto.limit,
      };
      await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
      return result;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getAllProgress(paginationDto: PaginationDto): Promise<{
    data: ProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    try {
      const cacheKey = `progresses:page=${paginationDto.page}:limit=${paginationDto.limit}:sort=${paginationDto.sort}:order=${paginationDto.order}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const progress = await this.progressModel
        .find()
        .skip((paginationDto.page - 1) * paginationDto.limit)
        .limit(paginationDto.limit);
      const total = await this.progressModel.countDocuments();
      const totalPages = Math.ceil(total / paginationDto.limit);
      const currentPage = Math.max(1, Math.min(paginationDto.page, totalPages));
      const result = {
        data: progress,
        total: total,
        totalPages: totalPages,
        currentPage: currentPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        limit: paginationDto.limit,
      };
      await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
      return result;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
