import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserBadgesService } from './user-badges.service';
import { CreateUserBadgeDto } from './dto/create-user-badge.dto';
import { UpdateUserBadgeDto } from './dto/update-user-badge.dto';

@Controller('user-badges')
export class UserBadgesController {
  constructor(private readonly userBadgesService: UserBadgesService) {}

  @Post()
  create(@Body() createUserBadgeDto: CreateUserBadgeDto) {
    return this.userBadgesService.create(createUserBadgeDto);
  }

  @Get()
  findAll() {
    return this.userBadgesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userBadgesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserBadgeDto: UpdateUserBadgeDto,
  ) {
    return this.userBadgesService.update(+id, updateUserBadgeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userBadgesService.remove(+id);
  }
}
