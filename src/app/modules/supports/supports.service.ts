import { Injectable } from '@nestjs/common';
import { CreateSupportDto } from './dto/create-support.dto';
import { UpdateSupportDto } from './dto/update-support.dto';

@Injectable()
export class SupportsService {
  create(createSupportDto: CreateSupportDto) {
    return 'This action adds a new support';
  }

  findAll() {
    return `This action returns all supports`;
  }

  findOne(id: number) {
    return `This action returns a #${id} support`;
  }

  update(id: number, updateSupportDto: UpdateSupportDto) {
    return `This action updates a #${id} support`;
  }

  remove(id: number) {
    return `This action removes a #${id} support`;
  }
}
