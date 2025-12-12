import { Controller, Param, Query, UseGuards } from '@nestjs/common';
import { UnitsService } from './units.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { UserRole } from '../users/schema/user.schema';
import { CreateUnitDto } from './dto/create-unit.dto';
import { Body, Delete, Get, Patch } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { PaginationDto } from '../pagination/pagination.dto';

@ApiTags('Units')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN, UserRole.TEACHER)
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new unit' })
  @ApiBody({
    description: 'Create a new unit',
    type: CreateUnitDto,
    examples: {
      normal: {
        summary: 'Example of a normal unit',
        value: {
          name: 'Unit 1',
          topic: 'Topic 1',
          slug: 'unit-1',
          skill: 'Skill 1',
          grade: 'Grade 1',
          level: 'Level 1',
          difficulty: 'Difficulty 1',
          totalLessons: 10,
          objectives: ['Objective 1', 'Objective 2'],
          keyVocabulary: ['Key Vocabulary 1', 'Key Vocabulary 2'],
          grammarFocus: ['Grammar Focus 1', 'Grammar Focus 2'],
          keyExpressions: ['Key Expressions 1', 'Key Expressions 2'],
          materials: {
            textLessons: ['Text Lesson 1', 'Text Lesson 2'],
            videos: ['Video 1', 'Video 2'],
            audios: ['Audio 1', 'Audio 2'],
            exercises: ['Exercise 1', 'Exercise 2'],
          },
          lessons: ['Lesson 1', 'Lesson 2'],
          relatedUnits: ['Related Unit 1', 'Related Unit 2'],
          prerequisites: ['Prerequisite 1', 'Prerequisite 2'],
          averageProgress: 50,
          estimatedDuration: 100,
          thumbnail: 'Thumbnail 1',
          banner: 'Banner 1',
          tags: ['Tag 1', 'Tag 2'],
          isActive: true,
          createdBy: 'Created By 1',
          updatedBy: 'Updated By 1',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Unit created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  create(@Body() createUnitDto: CreateUnitDto) {
    return this.unitsService.createUnit(createUnitDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all units' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({ status: 200, description: 'Units fetched successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.unitsService.findAllUnits(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a unit by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Unit ID' })
  @ApiResponse({ status: 200, description: 'Unit fetched successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  findById(@Param('id') id: string) {
    return this.unitsService.findUnitById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a unit by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Unit ID' })
  @ApiBody({ description: 'Update a unit', type: UpdateUnitDto })
  @ApiResponse({ status: 200, description: 'Unit updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  updateById(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
    return this.unitsService.updateUnitById(id, updateUnitDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a unit by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Unit ID' })
  @ApiResponse({ status: 200, description: 'Unit deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  deleteById(@Param('id') id: string) {
    return this.unitsService.deleteUnitById(id);
  }
}
