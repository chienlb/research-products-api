import {
  Controller,
  Delete,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Body, Get, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { UserRole } from '../users/schema/user.schema';
import {
  LessonStatus,
  LessonLevel,
  LessonSkill,
  LessonType,
  LessonActivityType,
} from './schema/lesson.schema';
import { PaginationDto } from '../pagination/pagination.dto';

@ApiTags('Lessons')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN, UserRole.TEACHER)
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new lesson' })
  @ApiBody({
    description: 'Create a new lesson',
    type: CreateLessonDto,
    examples: {
      normal: {
        summary: 'Example of a normal lesson',
        value: {
          title: 'Lesson 1',
          slug: 'lesson-1',
          description: 'Description of the lesson',
          type: LessonType.VOCABULARY,
          level: LessonLevel.A1,
          orderIndex: 1,
          unit: '669340000000000000000000',
          topic: 'Topic 1',
          skillFocus: LessonSkill.VOCABULARY,
          lessonFlow: [
            {
              title: 'Warm-up Activity',
              description: 'Introduction to the lesson',
              duration: 5,
              step: 1,
              type: LessonActivityType.SONG,
              skillFocus: LessonSkill.LISTENING,
              content: {
                vocabulary: {
                  description: 'Basic greetings',
                  words: [
                    { word: 'hello', definition: 'xin chào', ipa: '/həˈloʊ/', image: 'hello.jpg', audio: 'hello.mp3' },
                    { word: 'hi', definition: 'chào', ipa: '/haɪ/', image: 'hi.jpg', audio: 'hi.mp3' },
                    { word: 'goodbye', definition: 'tạm biệt', ipa: '/ˌɡʊdˈbaɪ/', audio: 'goodbye.mp3' },
                  ],
                  tags: ['greetings', 'basic'],
                },
              },
            },
            {
              title: 'Grammar Practice',
              description: 'Learn present simple tense',
              duration: 15,
              step: 2,
              type: LessonActivityType.EXERCISE,
              skillFocus: LessonSkill.GRAMMAR,
              content: {
                grammar: {
                  description: 'Present simple tense rules',
                  rule: 'Subject + Verb (s/es) + Object',
                  examples: [
                    { example: 'I play football.', translation: 'Tôi chơi bóng đá.' },
                    { example: 'She reads books.', translation: 'Cô ấy đọc sách.' },
                    { example: 'They go to school.', translation: 'Họ đi học.' },
                  ],
                  tags: ['grammar', 'tenses'],
                },
              },
            },
            {
              title: 'Song Activity',
              description: 'Learn through song',
              duration: 10,
              step: 3,
              type: LessonActivityType.SONG,
              skillFocus: LessonSkill.LISTENING,
              content: {
                songs: [
                  {
                    description: 'Greetings song',
                    lyrics: 'Hello, hello, how are you?',
                    translation: 'Xin chào, xin chào, bạn khỏe không?',
                    audio: 'greetings-song.mp3',
                    video: 'greetings-song.mp4',
                    vocabulary: [
                      { word: 'hello', definition: 'xin chào', ipa: '/həˈloʊ/' },
                      { word: 'how', definition: 'như thế nào', ipa: '/haʊ/' },
                    ],
                    questionsAndAnswers: [
                      {
                        question: 'What is the song about?',
                        answer: 'Greetings',
                      },
                    ],
                    tags: ['song', 'greetings'],
                  },
                ],
              },
            },
          ],
          locked: false,
          estimatedDuration: 10,
          materials: ['material-1', 'material-2'],
          thumbnail: 'thumbnail-1',
          audioIntro: 'audio-intro-1',
          videoIntro: 'video-intro-1',
          tags: ['tag-1', 'tag-2'],
          isActive: LessonStatus.ACTIVE,
          createdBy: '669340000000000000000000',
          updatedBy: '669340000000000000000000',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The lesson has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  createLesson(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.createLesson(createLessonDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lesson by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the lesson',
    type: String,
    example: '669340000000000000000000',
  })
  @ApiResponse({
    status: 200,
    description: 'The lesson has been successfully retrieved.',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  getLessonById(@Param('id') id: string) {
    return this.lessonsService.findLessonById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lessons' })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'The lessons have been successfully retrieved.',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  getAllLessons(@Query() paginationDto: PaginationDto) {
    return this.lessonsService.findAllLessons(paginationDto);
  }

  @Get(':id/unit')
  @ApiOperation({ summary: 'Get a lesson by unit ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the lesson',
    type: String,
    example: '669340000000000000000000',
  })
  @ApiResponse({
    status: 200,
    description: 'The lesson has been successfully retrieved.',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  getLessonByUnitId(@Param('id') id: string) {
    return this.lessonsService.findLessonsByUnitId(id);
  }

  @Get(':id/user')
  @ApiOperation({ summary: 'Get a lesson by user ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the lesson',
    type: String,
    example: '669340000000000000000000',
  })
  @ApiResponse({
    status: 200,
    description: 'The lesson has been successfully retrieved.',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  getLessonByUserId(@Param('id') id: string) {
    return this.lessonsService.findLessonsByUserId(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lesson by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the lesson',
    type: String,
    example: '669340000000000000000000',
  })
  @ApiBody({ description: 'Update a lesson', type: UpdateLessonDto })
  @ApiResponse({
    status: 200,
    description: 'The lesson has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  updateLessonById(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.updateLesson(id, updateLessonDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lesson by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the lesson',
    type: String,
    example: '669340000000000000000000',
  })
  @ApiResponse({
    status: 200,
    description: 'The lesson has been successfully deleted.',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  deleteLessonById(@Param('id') id: string) {
    return this.lessonsService.deleteLesson(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a lesson by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the lesson',
    type: String,
    example: '669340000000000000000000',
  })
  @ApiResponse({
    status: 200,
    description: 'The lesson has been successfully restored.',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  restoreLessonById(@Param('id') id: string) {
    return this.lessonsService.restoreLesson(id);
  }
}
