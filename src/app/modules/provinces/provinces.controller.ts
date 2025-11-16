import { Controller, Param, Query, Post, Body, Get, Put, Delete } from '@nestjs/common';
import { ProvincesService } from './provinces.service';
import { CreateProvinceDto } from './dto/create-province.dto';
import { UpdateProvinceDto } from './dto/update-province.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Provinces')
@Controller('provinces')
export class ProvincesController {
  constructor(private readonly provincesService: ProvincesService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new province' })
  @ApiBody({
    type: CreateProvinceDto,
    description: 'The province to create',
    examples: {
      normal: {
        summary: 'Example of a normal province',
        value: { provinceId: '1234567890', provinceName: 'Province 1', provinceCode: '1234567890', countryCode: '1234567890' }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'The province has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createProvince(@Body() createProvinceDto: CreateProvinceDto) {
    return this.provincesService.createProvince(createProvinceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all provinces' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({ status: 200, description: 'The provinces have been successfully retrieved.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findAllProvinces(
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ) {
    // Chuyển sang số nguyên để tránh lỗi type
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    return this.provincesService.findAllProvinces(pageNumber, limitNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a province by id' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the province' })
  @ApiResponse({ status: 200, description: 'The province has been successfully retrieved.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findProvinceById(@Param('id') id: string) {
    return this.provincesService.findProvinceById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a province by id' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the province' })
  @ApiBody({
    type: UpdateProvinceDto,
    description: 'The province to update',
    examples: {
      normal: {
        summary: 'Example of a normal province',
        value: { provinceName: 'Province 1', provinceCode: '1234567890', countryCode: '1234567890' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'The province has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateProvinceById(
    @Param('id') id: string,
    @Body() updateProvinceDto: UpdateProvinceDto
  ) {
    return this.provincesService.updateProvince(id, updateProvinceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a province by id' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the province' })
  @ApiResponse({ status: 200, description: 'The province has been successfully deleted.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteProvinceById(@Param('id') id: string) {
    return this.provincesService.deleteProvince(id);
  }
}