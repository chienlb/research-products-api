import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Get,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PronunciationService } from './pronunciations.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AssessPronunciationDto } from './dto/assess-pronunciation.dto';
import { CreatePronunciationExerciseDto } from './dto/create-pronunciation-exercise.dto';
import { UpdatePronunciationExerciseDto } from './dto/update-pronunciation-exercise.dto';

@ApiTags('Pronunciation')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('pronunciation')
export class PronunciationController {
  constructor(private readonly service: PronunciationService) { }

  @Post('assess')
  @UseInterceptors(FileInterceptor('audio'))
  @ApiOperation({
    summary: 'Assess pronunciation from audio file',
    description:
      'Upload an audio file and get pronunciation assessment scores including accuracy, fluency, and prosody',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['audio', 'referenceText'],
      properties: {
        audio: {
          type: 'string',
          format: 'binary',
          description: 'Audio file (WAV format recommended, 16kHz sample rate)',
        },
        referenceText: {
          type: 'string',
          example: 'Good morning',
          description: 'Reference text to compare pronunciation against',
        },
        language: {
          type: 'string',
          example: 'en-US',
          default: 'en-US',
          description: 'Language code for pronunciation assessment',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Pronunciation assessment successful',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'Success',
        },
        recognizedText: {
          type: 'string',
          example: 'Good morning',
        },
        scores: {
          type: 'object',
          properties: {
            pronScore: { type: 'number', example: 85.5 },
            accuracy: { type: 'number', example: 90.0 },
            fluency: { type: 'number', example: 88.0 },
            prosody: { type: 'number', example: 82.0 },
            completeness: { type: 'number', example: 95.0 },
            confidence: { type: 'number', example: 0.95 },
          },
        },
        words: {
          type: 'array',
          items: { type: 'object' },
        },
        raw: {
          type: 'object',
          description: 'Raw response from Azure Speech API',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Missing audio file or referenceText',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Azure Speech API error or missing configuration',
  })
  async assess(
    @UploadedFile() file: any,
    @Body() assessDto: AssessPronunciationDto,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('Missing audio file (field: audio)');
    }
    if (!assessDto.referenceText?.trim()) {
      throw new BadRequestException('Missing referenceText');
    }

    return this.service.assessShortAudio({
      audioBuffer: file.buffer,
      referenceText: assessDto.referenceText.trim(),
      language: assessDto.language || 'en-US',
    });
  }

  @Post('create')
  @ApiOperation({
    summary: 'Create a new pronunciation exercise',
    description: 'Create a new pronunciation exercise',
  })
  @ApiBody({
    type: CreatePronunciationExerciseDto,
    description: 'Create a new pronunciation exercise',
    examples: {
      example1: {
        value: {
          text: 'Hello',
          ipa: 'həˈləʊ',
          translation: 'Hello',
          description: 'Hello',
          referenceAudio: 'https://example.com/audio.wav',
          referenceAudioDuration: 100,
          lessonId: '1234567890',
          unitId: '1234567890',
          level: 'A1',
          difficulty: 'easy',
          topic: 'greetings',
          tags: ['greetings', 'hello'],
          minScore: 80,
          maxAttempts: 3,
          isActive: true,
          orderIndex: 1,
          createdBy: '1234567890',
          updatedBy: '1234567890',
        },
      },
    },
  })
  async create(@Body() createPronunciationExerciseDto: CreatePronunciationExerciseDto, @Req() req: any) {
    return this.service.createPronunciationExercise(createPronunciationExerciseDto, req.user.userId);
  }

  @Get('get-all')
  @ApiOperation({
    summary: 'Get all pronunciation exercises',
    description: 'Get all pronunciation exercises',
  })
  @ApiQuery({
    name: 'lessonId',
    type: String,
    description: 'The id of the lesson',
    example: '1234567890',
  })
  @ApiQuery({
    name: 'unitId',
    type: String,
    description: 'The id of the unit',
    example: '1234567890',
  })
  async getAll(@Query('lessonId') lessonId: string, @Query('unitId') unitId: string) {
    return this.service.getPronunciationExercises(lessonId as string, unitId as string);
  }

  @Get('get-by-id')
  @ApiOperation({
    summary: 'Get a pronunciation exercise by id',
    description: 'Get a pronunciation exercise by id',
  })
  @ApiQuery({
    name: 'id',
    type: String,
    description: 'The id of the pronunciation exercise',
    example: '1234567890',
  })
  async getById(@Query('id') id: string) {
    return this.service.getPronunciationExerciseById(id as string);
  }

  @Put('update')
  @ApiOperation({
    summary: 'Update a pronunciation exercise',
    description: 'Update a pronunciation exercise',
  })
  @ApiBody({
    type: UpdatePronunciationExerciseDto,
    description: 'Update a pronunciation exercise',
    examples: {
      example1: {
        value: {
          text: 'Hello',
          ipa: 'həˈləʊ',
          translation: 'Hello',
          description: 'Hello',
          referenceAudio: 'https://example.com/audio.wav',
          referenceAudioDuration: 100,
          lessonId: '1234567890',
          unitId: '1234567890',
          level: 'A1',
          difficulty: 'easy',
          topic: 'greetings',
          tags: ['greetings', 'hello'],
          minScore: 80,
          maxAttempts: 3,
          isActive: true,
          orderIndex: 1,
          createdBy: '1234567890',
          updatedBy: '1234567890',
        },
      },
    },
  })
  async update(@Param('id') id: string, @Body() updatePronunciationExerciseDto: UpdatePronunciationExerciseDto, @Req() req: any) {
    return this.service.updatePronunciationExercise(id, updatePronunciationExerciseDto, req.user.userId);
  }

  @Delete('delete')
  @ApiOperation({
    summary: 'Delete a pronunciation exercise',
    description: 'Delete a pronunciation exercise',
  })
  @ApiQuery({
    name: 'id',
    type: String,
    description: 'The id of the pronunciation exercise',
    example: '1234567890',
  })
  async delete(@Query('id') id: string) {
    return this.service.deletePronunciationExercise(id as string);
  }
}
