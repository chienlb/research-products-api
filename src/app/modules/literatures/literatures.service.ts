import { Injectable } from '@nestjs/common';
import { CreateLiteratureDto } from './dto/create-literature.dto';
import { UpdateLiteratureDto } from './dto/update-literature.dto';

@Injectable()
export class LiteraturesService {
  create(createLiteratureDto: CreateLiteratureDto) {
    return 'This action adds a new literature';
  }

  findAll() {
    return `This action returns all literatures`;
  }

  findOne(id: number) {
    return `This action returns a #${id} literature`;
  }

  update(id: number, updateLiteratureDto: UpdateLiteratureDto) {
    return `This action updates a #${id} literature`;
  }

  remove(id: number) {
    return `This action removes a #${id} literature`;
  }
}
