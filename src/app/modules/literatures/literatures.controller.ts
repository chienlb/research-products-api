import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LiteraturesService } from './literatures.service';
import { CreateLiteratureDto } from './dto/create-literature.dto';
import { UpdateLiteratureDto } from './dto/update-literature.dto';

@Controller('literatures')
export class LiteraturesController {
  constructor(private readonly literaturesService: LiteraturesService) {}

  @Post()
  create(@Body() createLiteratureDto: CreateLiteratureDto) {
    return this.literaturesService.create(createLiteratureDto);
  }

  @Get()
  findAll() {
    return this.literaturesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.literaturesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLiteratureDto: UpdateLiteratureDto,
  ) {
    return this.literaturesService.update(+id, updateLiteratureDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.literaturesService.remove(+id);
  }
}
