import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Progress, ProgressDocument, ProgressStatus, ProgressType } from './schema/progress.schema';
import { Model } from 'mongoose';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { AssignmentsService } from '../assignments/assignments.service';
import { LessonsService } from '../lessons/lessons.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProgressesService {
  constructor(
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    private readonly lessonsService: LessonsService,
    private readonly assignmentsService: AssignmentsService,
    private readonly usersService: UsersService,
  ) {}

  async createProgress(createProgressDto: CreateProgressDto): Promise<ProgressDocument> {
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
        const lesson = await this.lessonsService.findLessonById(createProgressDto.lessonId as string);
        if (!lesson) {
          throw new BadRequestException('Lesson not found');
        }
      }
      if (createProgressDto.type === ProgressType.ASSIGNMENT) {
        const assignment = await this.assignmentsService.getAssignmentById(createProgressDto.assignmentId as string);
        if (!assignment) {
          throw new BadRequestException('Assignment not found');
        }
      }

      const user = await this.usersService.findUserById(createProgressDto.userId as string);
      if (!user) {
        throw new BadRequestException('User not found');
      }
      const progress = await this.progressModel.create(createProgressDto);
      return progress;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateProgress(updateProgressDto: UpdateProgressDto): Promise<ProgressDocument> {
    try {
      const progress = await this.progressModel.findOneAndUpdate(
        { userId: updateProgressDto.userId,
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

  async deleteProgress(deleteProgressDto: UpdateProgressDto): Promise<ProgressDocument> {
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

  async getProgressByUserId(userId: string, page: number = 1, limit: number = 10): Promise<{
    data: ProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    try {
      const progress = await this.progressModel.find({ userId: userId }).skip((page - 1) * limit).limit(limit);
      const total = await this.progressModel.countDocuments({ userId: userId });
      const totalPages = Math.ceil(total / limit);
      const currentPage = Math.max(1, Math.min(page, totalPages));
      return {
        data: progress,
        total: total,
        totalPages: totalPages,
        currentPage: currentPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        limit: limit,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getProgressByCourseId(courseId: string, page: number = 1, limit: number = 10): Promise<{
    data: ProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    try {
      const progress = await this.progressModel.find({ courseId: courseId }).skip((page - 1) * limit).limit(limit);
      const total = await this.progressModel.countDocuments({ courseId: courseId });
      const totalPages = Math.ceil(total / limit);
      const currentPage = Math.max(1, Math.min(page, totalPages));
      return {
        data: progress,
        total: total,
        totalPages: totalPages,
        currentPage: currentPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        limit: limit,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getProgressByLessonId(lessonId: string, page: number = 1, limit: number = 10): Promise<{
    data: ProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    try {
      const progress = await this.progressModel.find({ lessonId: lessonId }).skip((page - 1) * limit).limit(limit);
      const total = await this.progressModel.countDocuments({ lessonId: lessonId });
      const totalPages = Math.ceil(total / limit);
      const currentPage = Math.max(1, Math.min(page, totalPages));
      return {
        data: progress,
        total: total,
        totalPages: totalPages,
        currentPage: currentPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        limit: limit,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getProgressByAssignmentId(assignmentId: string, page: number = 1, limit: number = 10): Promise<{
    data: ProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    try {
      const progress = await this.progressModel.find({ assignmentId: assignmentId }).skip((page - 1) * limit).limit(limit);
      const total = await this.progressModel.countDocuments({ assignmentId: assignmentId });
      const totalPages = Math.ceil(total / limit);
      const currentPage = Math.max(1, Math.min(page, totalPages));
      return {
        data: progress,
        total: total,
        totalPages: totalPages,
        currentPage: currentPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        limit: limit,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getProgressByUserIdAndCourseId(userId: string, courseId: string, page: number = 1, limit: number = 10): Promise<{
    data: ProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    try {
      const progress = await this.progressModel.find({ userId: userId, courseId: courseId }).skip((page - 1) * limit).limit(limit);
      const total = await this.progressModel.countDocuments({ userId: userId, courseId: courseId });
      const totalPages = Math.ceil(total / limit);
      const currentPage = Math.max(1, Math.min(page, totalPages));
      return {
        data: progress,
        total: total,
        totalPages: totalPages,
        currentPage: currentPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        limit: limit,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getAllProgress(page: number = 1, limit: number = 10): Promise<{
    data: ProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    try {
      const progress = await this.progressModel.find().skip((page - 1) * limit).limit(limit);
      const total = await this.progressModel.countDocuments();
      const totalPages = Math.ceil(total / limit);
      const currentPage = Math.max(1, Math.min(page, totalPages));
      return {
        data: progress,
        total: total,
        totalPages: totalPages,
        currentPage: currentPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        limit: limit,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}