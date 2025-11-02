import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SupportsService } from './supports.service';
import { CreateSupportDto } from './dto/create-support.dto';
import { UpdateSupportDto } from './dto/update-support.dto';

@Controller('supports')
export class SupportsController {
  constructor(private readonly supportsService: SupportsService) {}

  @Post()
  create(@Body() createSupportDto: CreateSupportDto) {
    return this.supportsService.create(createSupportDto);
  }

  @Get()
  findAll() {
    return this.supportsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.supportsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSupportDto: UpdateSupportDto) {
    return this.supportsService.update(+id, updateSupportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.supportsService.remove(+id);
  }
}
