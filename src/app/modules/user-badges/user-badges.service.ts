import { Injectable } from '@nestjs/common';
import { CreateUserBadgeDto } from './dto/create-user-badge.dto';
import { UpdateUserBadgeDto } from './dto/update-user-badge.dto';

@Injectable()
export class UserBadgesService {
  create(createUserBadgeDto: CreateUserBadgeDto) {
    return 'This action adds a new userBadge';
  }

  findAll() {
    return `This action returns all userBadges`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userBadge`;
  }

  update(id: number, updateUserBadgeDto: UpdateUserBadgeDto) {
    return `This action updates a #${id} userBadge`;
  }

  remove(id: number) {
    return `This action removes a #${id} userBadge`;
  }
}
