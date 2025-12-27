import { Injectable, Inject, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  LessonProgress,
  LessonProgressDocument,
} from './schema/lesson-progress.schema';
import { Model } from 'mongoose';
import { LessonsService } from '../lessons/lessons.service';
import { UsersService } from '../users/users.service';
import { CreateLessonProgressDto } from './dto/create-lesson-progress.dto';
import { PaginationDto } from '../pagination/pagination.dto';
import { UpdateLessonProgressDto } from './dto/update-lesson-progress.dto';
import { LessonDocument } from '../lessons/schema/lesson.schema';
import { UnitsService } from '../units/units.service';
import { Types } from 'mongoose';

@Injectable()
export class LessonProgressService {
  constructor(
    @InjectModel(LessonProgress.name)
    private lessonProgressModel: Model<LessonProgressDocument>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => LessonsService)) private readonly lessonsService: LessonsService,
    private readonly unitsService: UnitsService,
  ) { }

  async createLessonPrgress(
    createLessonProgressDto: CreateLessonProgressDto,
  ): Promise<LessonProgressDocument> {
    try {
      const user = await this.usersService.findUserById(
        createLessonProgressDto.userId.toString(),
      );
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const lesson = await this.lessonsService.findLessonById(
        createLessonProgressDto.lessonId.toString(),
      );
      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }
      user.exp = user.exp
        ? (user.exp as number) + createLessonProgressDto.progress * 10
        : createLessonProgressDto.progress * 10;
      user.streakDays = user.streakDays ? user.streakDays + 1 : 1;
      await user.save();
      const lessonProgress = new this.lessonProgressModel(createLessonProgressDto);
      return lessonProgress.save();
    } catch (error) {
      throw new Error('Failed to create lesson progress: ' + error.message);
    }
  }

  async findLessonPrgressByUserId(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    data: LessonProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    try {
      const user = await this.usersService.findUserById(userId.toString());
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const lessonProgress = await this.lessonProgressModel
        .find({ userId: user._id })
        .skip((paginationDto.page - 1) * paginationDto.limit)
        .limit(paginationDto.limit)
        .sort({ [paginationDto.sort]: paginationDto.order === 'asc' ? 1 : -1 });
      const total = await this.lessonProgressModel.countDocuments({
        userId: user._id,
      });
      const totalPages = Math.ceil(total / paginationDto.limit);
      const currentPage = Math.max(1, Math.min(paginationDto.page, totalPages));
      return {
        data: lessonProgress,
        total: total,
        totalPages: totalPages,
        currentPage: currentPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        limit: paginationDto.limit,
      };
    } catch (error) {
      throw new Error(
        'Failed to find lesson progress by user id: ' + error.message,
      );
    }
  }

  async findLessonPrgressByLessonId(
    lessonId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    data: LessonProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    try {
      const lesson = await this.lessonsService.findLessonById(
        lessonId.toString(),
      );
      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }
      const lessonProgress = await this.lessonProgressModel
        .find({ lessonId: lesson._id })
        .skip((paginationDto.page - 1) * paginationDto.limit)
        .limit(paginationDto.limit)
        .sort({ [paginationDto.sort]: paginationDto.order === 'asc' ? 1 : -1 });
      const total = await this.lessonProgressModel.countDocuments({
        lessonId: lesson._id,
      });
      const totalPages = Math.ceil(total / paginationDto.limit);
      const currentPage = Math.max(1, Math.min(paginationDto.page, totalPages));
      return {
        data: lessonProgress,
        total: total,
        totalPages: totalPages,
        currentPage: currentPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        limit: paginationDto.limit,
      };
    } catch (error) {
      throw new Error(
        'Failed to find lesson progress by lesson id: ' + error.message,
      );
    }
  }

  async updateLessonPrgress(
    lessonId: string,
    updateLessonPrgressDto: UpdateLessonProgressDto,
  ): Promise<LessonProgressDocument> {
    try {
      const lesson = await this.lessonsService.findLessonById(
        lessonId.toString(),
      );
      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }
      const lessonProgress = await this.lessonProgressModel.findByIdAndUpdate(
        lesson._id,
        updateLessonPrgressDto,
        { new: true },
      );
      if (!lessonProgress) {
        throw new NotFoundException('Lesson progress not found');
      }
      return lessonProgress;
    } catch (error) {
      throw new Error('Failed to update lesson progress: ' + error.message);
    }
  }

  async deleteLessonProgress(lessonId: string): Promise<void> {
    try {
      const lesson = await this.lessonsService.findLessonById(
        lessonId.toString(),
      );
      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }
      await this.lessonProgressModel.findByIdAndDelete(lesson._id);
    } catch (error) {
      throw new Error('Failed to delete lesson progress: ' + error.message);
    }
  }

  async getLessonByUserId(userId: string, unitId: string, orderIndex: number): Promise<LessonProgressDocument> {
    try {
      const user = await this.usersService.findUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const unit = await this.unitsService.findUnitById(unitId);
      if (!unit) {
        throw new NotFoundException('Unit not found');
      }
      const lessonProgress = await this.lessonProgressModel.findOne({ userId: new Types.ObjectId(userId), unitId: new Types.ObjectId(unitId), orderIndex: orderIndex });
      if (!lessonProgress) {
        throw new NotFoundException('Lesson progress not found');
      }
      return lessonProgress;
    } catch (error) {
      throw new Error('Failed to get lesson by user id: ' + error.message);
    }
  }
}
