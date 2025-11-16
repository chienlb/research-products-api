import { Controller, Post, Body, Get, Param, Put, Delete, Query } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';

@Controller('schools')
@ApiTags('Schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new school' })
  @ApiBody({ type: CreateSchoolDto, description: 'The school to create', examples: { normal: { summary: 'Example of a normal school', value: { schoolId: '1234567890', schoolName: 'School 1', schoolLevel: 'Primary', districtId: '1234567890', districtName: 'District 1', provinceId: '1234567890', provinceName: 'Province 1' } } } })
  @ApiResponse({ status: 201, description: 'The school has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createSchool(@Body() createSchoolDto: CreateSchoolDto) {
    return this.schoolsService.createSchool(createSchoolDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all schools' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({ status: 200, description: 'The schools have been successfully retrieved.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findAllSchools(@Query('page') page: number, @Query('limit') limit: number) {
    return this.schoolsService.findAllSchools(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a school by id' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the school' })
  @ApiResponse({ status: 200, description: 'The school has been successfully retrieved.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findSchoolById(@Param('id') id: string) {
    return this.schoolsService.findSchoolById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a school by id' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the school' })
  @ApiBody({ type: UpdateSchoolDto, description: 'The school to update', examples: { normal: { summary: 'Example of a normal school', value: { schoolName: 'School 1', schoolLevel: 'Primary', districtId: '1234567890', districtName: 'District 1', provinceId: '1234567890', provinceName: 'Province 1' } } } })
  @ApiResponse({ status: 200, description: 'The school has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateSchoolById(@Param('id') id: string, @Body() updateSchoolDto: UpdateSchoolDto) {
    return this.schoolsService.updateSchool(id, updateSchoolDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a school by id' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the school' })
  @ApiResponse({ status: 200, description: 'The school has been successfully deleted.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteSchoolById(@Param('id') id: string) {
    return this.schoolsService.deleteSchool(id);
  }
}