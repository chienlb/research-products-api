import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Request,
} from '@nestjs/common';
import { ProgressesService } from './progresses.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProgressDocument, ProgressType } from './schema/progress.schema';
import { PaginationDto } from '../pagination/pagination.dto';

@Controller('progresses')
@ApiTags('Progresses')
@UseGuards(AuthGuard('jwt'))
export class ProgressesController {
  constructor(private readonly progressesService: ProgressesService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new progress' })
  @ApiBody({
    type: CreateProgressDto,
    description: 'Create progress data',
    examples: {
      example: {
        value: {
          userId: '123',
          type: 'lesson',
          lessonId: '123',
          progressPercent: 50,
          timeSpent: 30,
          status: 'completed',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Progress created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        type: { type: 'string' },
        lessonId: { type: 'string' },
        progressPercent: { type: 'number' },
        timeSpent: { type: 'number' },
        status: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createProgress(
    @Body() createProgressDto: CreateProgressDto,
  ): Promise<ProgressDocument> {
    return await this.progressesService.createProgress(createProgressDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a progress' })
  @ApiBody({
    type: UpdateProgressDto,
    description: 'Update progress data',
    examples: {
      example: {
        value: { progressPercent: 75, timeSpent: 45, status: 'completed' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Progress updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        type: { type: 'string' },
        lessonId: { type: 'string' },
        progressPercent: { type: 'number' },
        timeSpent: { type: 'number' },
        status: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async updateProgress(
    @Param('id') id: string,
    @Body() updateProgressDto: UpdateProgressDto,
  ): Promise<ProgressDocument> {
    return await this.progressesService.updateProgress(updateProgressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a progress' })
  @ApiResponse({ status: 200, description: 'Progress deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async deleteProgress(@Param('id') id: string): Promise<ProgressDocument> {
    return await this.progressesService.deleteProgress({
      userId: id,
      type: ProgressType.LESSON,
      lessonId: id,
    });
  }

  @Get('user/:userId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all progresses by user id' })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Limit number',
  })
  @ApiResponse({
    status: 200,
    description: 'Progresses fetched successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              type: { type: 'string' },
              lessonId: { type: 'string' },
              progressPercent: { type: 'number' },
              timeSpent: { type: 'number' },
              status: { type: 'string' },
            },
          },
        },
        total: { type: 'number' },
        totalPages: { type: 'number' },
        currentPage: { type: 'number' },
        hasNextPage: { type: 'boolean' },
        hasPreviousPage: { type: 'boolean' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async getProgressByUserId(
    @Req() req: Request,
    @Query() paginationDto: PaginationDto
  ) {
    const userId = (req as any).user.userId;
    return await this.progressesService.getProgressByUserId(userId, paginationDto);
  }

  @Get('course/:courseId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all progresses by course id' })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Limit number',
  })
  @ApiResponse({
    status: 200,
    description: 'Progresses fetched successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              type: { type: 'string' },
              lessonId: { type: 'string' },
              progressPercent: { type: 'number' },
              timeSpent: { type: 'number' },
              status: { type: 'string' },
            },
          },
        },
        total: { type: 'number' },
        totalPages: { type: 'number' },
        currentPage: { type: 'number' },
        hasNextPage: { type: 'boolean' },
        hasPreviousPage: { type: 'boolean' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async getProgressByCourseId(
    @Param('courseId') courseId: string,
    @Query() paginationDto: PaginationDto
  ): Promise<{
    data: ProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    return await this.progressesService.getProgressByCourseId(
      courseId,
      paginationDto,
    );
  }

  @Get('lesson/:lessonId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all progresses by lesson id' })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Limit number',
  })
  @ApiResponse({
    status: 200,
    description: 'Progresses fetched successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              type: { type: 'string' },
              lessonId: { type: 'string' },
              progressPercent: { type: 'number' },
              timeSpent: { type: 'number' },
              status: { type: 'string' },
            },
          },
        },
        total: { type: 'number' },
        totalPages: { type: 'number' },
        currentPage: { type: 'number' },
        hasNextPage: { type: 'boolean' },
        hasPreviousPage: { type: 'boolean' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async getProgressByLessonId(
    @Param('lessonId') lessonId: string,
    @Query() paginationDto: PaginationDto
  ): Promise<{
    data: ProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    return await this.progressesService.getProgressByLessonId(
      lessonId,
      paginationDto,
    );
  }

  @Get('assignment/:assignmentId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all progresses by assignment id' })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Limit number',
  })
  @ApiResponse({
    status: 200,
    description: 'Progresses fetched successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              type: { type: 'string' },
              lessonId: { type: 'string' },
              progressPercent: { type: 'number' },
              timeSpent: { type: 'number' },
              status: { type: 'string' },
            },
          },
        },
        total: { type: 'number' },
        totalPages: { type: 'number' },
        currentPage: { type: 'number' },
        hasNextPage: { type: 'boolean' },
        hasPreviousPage: { type: 'boolean' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async getProgressByAssignmentId(
    @Param('assignmentId') assignmentId: string,
    @Query() paginationDto: PaginationDto
  ): Promise<{
    data: ProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    return await this.progressesService.getProgressByAssignmentId(
      assignmentId,
      paginationDto,
    );
  }

  @Get('user/:userId/course/:courseId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all progresses by user id and course id' })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Limit number',
  })
  @ApiResponse({
    status: 200,
    description: 'Progresses fetched successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              type: { type: 'string' },
              lessonId: { type: 'string' },
              progressPercent: { type: 'number' },
              timeSpent: { type: 'number' },
              status: { type: 'string' },
            },
          },
        },
        total: { type: 'number' },
        totalPages: { type: 'number' },
        currentPage: { type: 'number' },
        hasNextPage: { type: 'boolean' },
        hasPreviousPage: { type: 'boolean' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async getProgressByUserIdAndCourseId(
    @Req() req: Request,
    @Param('courseId') courseId: string,
    @Query() paginationDto: PaginationDto
  ): Promise<{
    data: ProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    const userId = (req as any).user.userId;
    return await this.progressesService.getProgressByUserIdAndCourseId(
      userId,
      courseId,
      paginationDto,
    );
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all progresses' })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Limit number',
  })
  @ApiResponse({
    status: 200,
    description: 'Progresses fetched successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              type: { type: 'string' },
              lessonId: { type: 'string' },
              progressPercent: { type: 'number' },
              timeSpent: { type: 'number' },
              status: { type: 'string' },
            },
          },
        },
        total: { type: 'number' },
        totalPages: { type: 'number' },
        currentPage: { type: 'number' },
        hasNextPage: { type: 'boolean' },
        hasPreviousPage: { type: 'boolean' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async getAllProgress(
    @Query() paginationDto: PaginationDto
  ): Promise<{
    data: ProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    return await this.progressesService.getAllProgress(paginationDto);
  }
}
