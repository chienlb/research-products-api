import { Controller, HttpException, Post, Body, Query, Get, Param, Put, Patch, Delete } from '@nestjs/common';
import { LiteraturesService } from './literatures.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateLiteratureDto } from './dto/create-literature.dto';
import { UpdateLiteratureDto } from './dto/update-literature.dto';


@ApiTags('Literatures')
@ApiBearerAuth()
@Controller('literatures')
export class LiteraturesController {
  constructor(private readonly literaturesService: LiteraturesService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new literature' })
  @ApiBody({
    type: CreateLiteratureDto,
    description: 'The literature to create',
    examples: {
      example1: {
        value: {
          title: 'The Lion King',
          type: 'story',
          level: 'beginner',
          topic: 'animals',
          contentEnglish: 'The Lion King is a story about a lion king who is the king of the jungle.',
          contentVietnamese: 'Truyện The Lion King là một câu chuyện về một con sư tử người láng giềng.',
          vocabulary: ['lion', 'king', 'jungle'],
          grammarPoints: ['simple present tense', 'simple past tense', 'simple future tense'],
          audioUrl: 'https://example.com/audio.mp3',
          imageUrl: 'https://example.com/image.jpg',
          comprehensionQuestions: ['What is the main character?', 'What is the main character doing?', 'What is the main character doing?'],
          isPublished: true,
          createdBy: '1234567890',
          updatedBy: '1234567890',
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'The literature has been successfully created.', type: CreateLiteratureDto })
  @ApiResponse({ status: 400, description: 'Bad Request', type: HttpException })
  async createLiterature(@Body() createLiteratureDto: CreateLiteratureDto): Promise<any> {
    return this.literaturesService.createLiterature(createLiteratureDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all literatures' })
  @ApiQuery({ name: 'page', type: Number, description: 'The page number', required: false })
  @ApiQuery({ name: 'limit', type: Number, description: 'The number of items per page', required: false })
  @ApiResponse({
    status: 200,
    description: 'The literatures have been successfully retrieved.',
    schema: {
      type: 'object',
      properties: {
        page: { type: 'number' },
        limit: { type: 'number' },
        total: { type: 'number' },
        totalPages: { type: 'number' },
        currentPage: { type: 'number' },
        hasNextPage: { type: 'boolean' },
        hasPreviousPage: { type: 'boolean' },
        nextPage: { type: 'number' },
        previousPage: { type: 'number' },
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request', type: HttpException })
  async getLiteratures(@Query() query: any): Promise<any> {
    return this.literaturesService.getLiteratures(query.page, query.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a literature by id' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the literature' })
  @ApiResponse({ status: 200, description: 'The literature has been successfully retrieved.', type: CreateLiteratureDto })
  @ApiResponse({ status: 400, description: 'Bad Request', type: HttpException })
  async getLiteratureById(@Param('id') id: string): Promise<any> {
    return this.literaturesService.getLiteratureById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a literature by id' })
  @ApiBody({ type: UpdateLiteratureDto, description: 'The literature to update' })
  @ApiResponse({ status: 200, description: 'The literature has been successfully updated.', type: UpdateLiteratureDto })
  @ApiResponse({ status: 400, description: 'Bad Request', type: HttpException })
  async updateLiteratureById(@Param('id') id: string, @Body() updateLiteratureDto: UpdateLiteratureDto): Promise<any> {
    return this.literaturesService.updateLiterature(id, updateLiteratureDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a literature by id' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the literature' })
  @ApiResponse({ status: 200, description: 'The literature has been successfully deleted.', type: CreateLiteratureDto })
  @ApiResponse({ status: 400, description: 'Bad Request', type: HttpException })
  async deleteLiteratureById(@Param('id') id: string): Promise<any> {
    return this.literaturesService.deleteLiterature(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Restore a literature by id' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the literature' })
  @ApiResponse({ status: 200, description: 'The literature has been successfully restored.', type: CreateLiteratureDto })
  @ApiResponse({ status: 400, description: 'Bad Request', type: HttpException })
  async restoreLiteratureById(@Param('id') id: string): Promise<any> {
    return this.literaturesService.restoreLiterature(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change the status of a literature by id' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the literature' })
  @ApiResponse({ status: 200, description: 'The literature has been successfully changed.', type: CreateLiteratureDto })
  @ApiResponse({ status: 400, description: 'Bad Request', type: HttpException })
  async changeLiteratureStatusById(@Param('id') id: string, @Body() status: boolean): Promise<any> {
    return this.literaturesService.changeLiteratureStatus(id, status);
  }
}

