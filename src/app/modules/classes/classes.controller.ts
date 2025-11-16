import { Controller, Post, Body, Get, Param, Put, Delete, Query } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Classes')
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new class' })
  @ApiBody({ type: CreateClassDto, description: 'The class to create', examples: { normal: { summary: 'Example of a normal class', value: { classId: '1234567890', className: 'Class 1', schoolGrade: '1', schoolId: '1234567890', schoolName: 'School 1', districtName: 'District 1', provinceName: 'Province 1' } } } })
  @ApiResponse({ status: 201, description: 'The class has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createClass(@Body() createClassDto: CreateClassDto) {
    return this.classesService.createClass(createClassDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all classes' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({ status: 200, description: 'The classes have been successfully retrieved.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findAllClasses(@Query('page') page: number, @Query('limit') limit: number) {
    return this.classesService.findAllClasses(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a class by id' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the class' })
  @ApiResponse({ status: 200, description: 'The class has been successfully retrieved.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findClassById(@Param('id') id: string) {
    return this.classesService.findClassById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a class by id' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the class' })
  @ApiBody({ type: UpdateClassDto, description: 'The class to update', examples: { normal: { summary: 'Example of a normal class', value: { className: 'Class 1', schoolGrade: '1', schoolId: '1234567890', schoolName: 'School 1', districtName: 'District 1', provinceName: 'Province 1' } } } })
  @ApiResponse({ status: 200, description: 'The class has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateClassById(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classesService.updateClass(id, updateClassDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a class by id' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the class' })
  @ApiResponse({ status: 200, description: 'The class has been successfully deleted.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteClassById(@Param('id') id: string) {
    return this.classesService.deleteClass(id);
  }
}