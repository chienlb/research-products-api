import { Controller, Param, Query, Post, Body, Get, Put, Delete } from '@nestjs/common';
import { DistrictsService } from './districts.service';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Districts')
@Controller('districts')
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new district' })
  @ApiBody({ type: CreateDistrictDto, description: 'The district to create', examples: { normal: { summary: 'Example of a normal district', value: { districtId: '1234567890', districtName: 'District 1', districtCode: '1234567890', provinceCode: '1234567890' } } } })
  @ApiResponse({ status: 201, description: 'The district has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createDistrict(@Body() createDistrictDto: CreateDistrictDto) {
    return this.districtsService.createDistrict(createDistrictDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all districts' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({ status: 200, description: 'The districts have been successfully retrieved.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findAllDistricts(@Query('page') page: number, @Query('limit') limit: number) {
    return this.districtsService.findAllDistricts(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a district by id' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the district' })
  @ApiResponse({ status: 200, description: 'The district has been successfully retrieved.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findDistrictById(@Param('id') id: string) {
    return this.districtsService.findDistrictById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a district by id' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the district' })
  @ApiBody({ type: UpdateDistrictDto, description: 'The district to update', examples: { normal: { summary: 'Example of a normal district', value: { districtName: 'District 1', districtCode: '1234567890', provinceCode: '1234567890' } } } })
  @ApiResponse({ status: 200, description: 'The district has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateDistrictById(@Param('id') id: string, @Body() updateDistrictDto: UpdateDistrictDto) {
    return this.districtsService.updateDistrict(id, updateDistrictDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a district by id' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the district' })
  @ApiResponse({ status: 200, description: 'The district has been successfully deleted.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteDistrictById(@Param('id') id: string) {
    return this.districtsService.deleteDistrict(id);
  }
}