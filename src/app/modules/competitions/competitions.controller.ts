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
import { CompetitionsService } from './competitions.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { CompetitionDocument, CompetitionStatus, CompetitionType, CompetitionVisibility } from './schema/competition.schema';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@Controller('competitions')
@ApiTags('Competitions')
@UseGuards(AuthGuard('jwt'))
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new competition' })
  @ApiBody({
    type: CreateCompetitionDto,
    description: 'Create competition data',
    examples: {
      example: {
        value: {
          name: 'Test',
          description: 'Test',
          type: CompetitionType.INDIVIDUAL,
          subject: 'Test',
          startTime: new Date(),
          endTime: new Date(),
          createdBy: '123',
          updatedBy: '123',
          totalParticipants: 1,
          participants: ['123'],
          maxParticipants: 1,
          prize: 'Test',
          status: CompetitionStatus.UPCOMING,
          results: [{ userId: '123', score: 100 }],
          badgeId: '123',
          visibility: CompetitionVisibility.PUBLIC,
          isPublished: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Competition created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        type: { type: 'string' },
        subject: { type: 'string' },
        startTime: { type: 'string' },
        endTime: { type: 'string' },
        createdBy: { type: 'string' },
        updatedBy: { type: 'string' },
        totalParticipants: { type: 'number' },
        participants: { type: 'array', items: { type: 'string' } },
        maxParticipants: { type: 'number' },
        prize: { type: 'string' },
        status: { type: 'string' },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
              score: { type: 'number' },
            },
          },
        },
        badgeId: { type: 'string' },
        visibility: { type: 'string' },
        isPublished: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createCompetition(
    @Body() createCompetitionDto: CreateCompetitionDto,
  ): Promise<CompetitionDocument> {
    return await this.competitionsService.createCompetition(
      createCompetitionDto,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a competition by id' })
  @ApiParam({ name: 'id', type: String, description: 'Competition id' })
  @ApiResponse({ status: 200, description: 'Competition fetched successfully', schema: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, description: { type: 'string' }, type: { type: 'string' }, subject: { type: 'string' }, startTime: { type: 'string' }, endTime: { type: 'string' }, createdBy: { type: 'string' }, updatedBy: { type: 'string' }, totalParticipants: { type: 'number' }, participants: { type: 'array', items: { type: 'string' } }, maxParticipants: { type: 'number' }, prize: { type: 'string' }, status: { type: 'string' }, results: { type: 'array', items: { type: 'object', properties: { userId: { type: 'string' }, score: { type: 'number' } } } }, badgeId: { type: 'string' }, visibility: { type: 'string' }, isPublished: { type: 'boolean' } } } })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getCompetitionById(@Param('id') id: string): Promise<CompetitionDocument> {
    return await this.competitionsService.findCompetitionById(id);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all competitions' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Limit number' })
  @ApiResponse({ status: 200, description: 'Competitions fetched successfully', schema: { type: 'object', properties: { data: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, description: { type: 'string' }, type: { type: 'string' }, subject: { type: 'string' }, startTime: { type: 'string' }, endTime: { type: 'string' }, createdBy: { type: 'string' }, updatedBy: { type: 'string' }, totalParticipants: { type: 'number' }, participants: { type: 'array', items: { type: 'string' } }, maxParticipants: { type: 'number' }, prize: { type: 'string' }, status: { type: 'string' }, results: { type: 'array', items: { type: 'object', properties: { userId: { type: 'string' }, score: { type: 'number' } } } }, badgeId: { type: 'string' }, visibility: { type: 'string' }, isPublished: { type: 'boolean' } } } }, total: { type: 'number' }, totalPages: { type: 'number' }, nextPage: { type: 'number' }, prevPage: { type: 'number' }, limit: { type: 'number' } } } })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAllCompetitions(@Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<{ data: CompetitionDocument[]; total: number; totalPages: number; nextPage: number | null; prevPage: number | null; limit: number }> {
    return await this.competitionsService.findAllCompetitions(page, limit);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a competition' })
  @ApiParam({ name: 'id', type: String, description: 'Competition id' })
  @ApiBody({ type: UpdateCompetitionDto, description: 'Update competition data', examples: { 'example': { value: { name: 'Test', description: 'Test', type: CompetitionType.INDIVIDUAL, subject: 'Test', startTime: new Date(), endTime: new Date(), createdBy: '123', updatedBy: '123', totalParticipants: 1, participants: ['123'], maxParticipants: 1, prize: 'Test', status: CompetitionStatus.UPCOMING, results: [{ userId: '123', score: 100 }], badgeId: '123', visibility: CompetitionVisibility.PUBLIC, isPublished: true } } } })
  @ApiResponse({ status: 200, description: 'Competition updated successfully', schema: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, description: { type: 'string' }, type: { type: 'string' }, subject: { type: 'string' }, startTime: { type: 'string' }, endTime: { type: 'string' }, createdBy: { type: 'string' }, updatedBy: { type: 'string' }, totalParticipants: { type: 'number' }, participants: { type: 'array', items: { type: 'string' } }, maxParticipants: { type: 'number' }, prize: { type: 'string' }, status: { type: 'string' }, results: { type: 'array', items: { type: 'object', properties: { userId: { type: 'string' }, score: { type: 'number' } } } }, badgeId: { type: 'string' }, visibility: { type: 'string' }, isPublished: { type: 'boolean' } } } })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateCompetition(@Param('id') id: string, @Body() updateCompetitionDto: UpdateCompetitionDto): Promise<CompetitionDocument> {
    return await this.competitionsService.updateCompetition(id, updateCompetitionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a competition' })
  @ApiParam({ name: 'id', type: String, description: 'Competition id' })
  @ApiResponse({ status: 200, description: 'Competition deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteCompetition(@Param('id') id: string): Promise<CompetitionDocument> {
    return await this.competitionsService.deleteCompetition(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get competitions by user id' })
  @ApiParam({ name: 'userId', type: String, description: 'User id' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Limit number' })
  @ApiResponse({ status: 200, description: 'Competitions fetched successfully', schema: { type: 'object', properties: { data: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, description: { type: 'string' }, type: { type: 'string' }, subject: { type: 'string' }, startTime: { type: 'string' }, endTime: { type: 'string' }, createdBy: { type: 'string' }, updatedBy: { type: 'string' }, totalParticipants: { type: 'number' }, participants: { type: 'array', items: { type: 'string' } }, maxParticipants: { type: 'number' }, prize: { type: 'string' }, status: { type: 'string' }, results: { type: 'array', items: { type: 'object', properties: { userId: { type: 'string' }, score: { type: 'number' } } } }, badgeId: { type: 'string' }, visibility: { type: 'string' }, isPublished: { type: 'boolean' } } } }, total: { type: 'number' }, totalPages: { type: 'number' }, nextPage: { type: 'number' }, prevPage: { type: 'number' }, limit: { type: 'number' } } } })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getCompetitionsByUserId(@Param('userId') userId: string, @Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<{ data: CompetitionDocument[]; total: number; totalPages: number; nextPage: number | null; prevPage: number | null; limit: number }> {
    return await this.competitionsService.findCompetitionsByUserId(userId, page, limit);
  }
}
