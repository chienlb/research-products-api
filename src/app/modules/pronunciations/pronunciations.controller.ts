import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
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
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AssessPronunciationDto } from './dto/assess-pronunciation.dto';

@ApiTags('Pronunciation')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('pronunciation')
export class PronunciationController {
  constructor(private readonly service: PronunciationService) {}

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
}
