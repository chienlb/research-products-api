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

@Controller('progresses')
@ApiTags('Progresses')
@UseGuards(AuthGuard('jwt'))
export class ProgressesController {
  constructor(private readonly progressesService: ProgressesService) {}

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
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{
    data: ProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    return await this.progressesService.getProgressByUserId(
      userId,
      page,
      limit,
    );
  }

  @Get('course/:courseId')
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
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
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
      page,
      limit,
    );
  }

  @Get('lesson/:lessonId')
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
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
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
      page,
      limit,
    );
  }

  @Get('assignment/:assignmentId')
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
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
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
      page,
      limit,
    );
  }

  @Get('user/:userId/course/:courseId')
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
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{
    data: ProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    return await this.progressesService.getProgressByUserIdAndCourseId(
      userId,
      courseId,
      page,
      limit,
    );
  }

  @Get('all')
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
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{
    data: ProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    return await this.progressesService.getAllProgress(page, limit);
  }
}
