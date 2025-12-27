import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { LessonProgressService } from './lesson-progress.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LessonProgressDocument } from './schema/lesson-progress.schema';
import { UpdateLessonProgressDto } from './dto/update-lesson-progress.dto';
import { PaginationDto } from '../pagination/pagination.dto';
import { CreateLessonProgressDto } from './dto/create-lesson-progress.dto';

@Controller('lesson-prgress')
@ApiTags('Lesson Prgress')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class LessonPrgressController {
  constructor(private readonly lessonProgressService: LessonProgressService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new lesson prgress' })
  @ApiBody({
    type: CreateLessonProgressDto,
    description: 'Create lesson prgress data',
    examples: {
      example: {
        value: {
          userId: '123',
          lessonId: '123',
          progress: 50,
          status: 'completed',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Lesson prgress created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        lessonId: { type: 'string' },
        progress: { type: 'number' },
        status: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createLessonPrgress(
    @Body() createLessonProgressDto: CreateLessonProgressDto,
  ): Promise<LessonProgressDocument> {
    return await this.lessonProgressService.createLessonPrgress(createLessonProgressDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all lesson prgress by user id' })
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
    description: 'Lesson prgress fetched successfully',
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
              lessonId: { type: 'string' },
              progress: { type: 'number' },
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
  async getLessonPrgressByUserId(
    @Param('userId') userId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<{
    data: LessonProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    return await this.lessonProgressService.findLessonPrgressByUserId(userId, paginationDto);
  }

  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Get all lesson prgress by lesson id' })
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
    description: 'Lesson prgress fetched successfully',
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
              lessonId: { type: 'string' },
              progress: { type: 'number' },
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
  async getLessonPrgressByLessonId(
    @Param('lessonId') lessonId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<{
    data: LessonProgressDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  }> {
    return await this.lessonProgressService.findLessonPrgressByLessonId(lessonId, paginationDto);
  }

  @Put(':lessonId')
  @ApiOperation({ summary: 'Update a lesson prgress' })
  @ApiBody({
    type: UpdateLessonProgressDto,
    description: 'Update lesson prgress data',
    examples: {
      example: {
        value: {
          progress: 50,
          status: 'completed',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Lesson prgress updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        lessonId: { type: 'string' },
        progress: { type: 'number' },
        status: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async updateLessonPrgress(
    @Param('lessonId') lessonId: string,
    @Body() updateLessonProgressDto: UpdateLessonProgressDto,
  ): Promise<LessonProgressDocument> {
    return await this.lessonProgressService.updateLessonPrgress(lessonId, updateLessonProgressDto);
  }

  @Delete(':lessonId')
  @ApiOperation({ summary: 'Delete a lesson prgress' })
  @ApiResponse({
    status: 200,
    description: 'Lesson prgress deleted successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async deleteLessonPrgress(
    @Param('lessonId') lessonId: string,
  ): Promise<void> {
    return await this.lessonProgressService.deleteLessonProgress(lessonId);
  }
}