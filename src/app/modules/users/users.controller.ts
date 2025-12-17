import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
  Query,
  Session,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ok } from '../../common/response/api-response';
import { UserRole } from './schema/user.schema';

import { JwtStrategy } from '../auths/strategies/jwt.strategy';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { PaginationDto } from '../pagination/pagination.dto';
import mongoose, { ClientSession } from 'mongoose';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    description: 'Create a new user',
    type: CreateUserDto,
  })
  @ApiResponse({ status: 201, description: 'Created.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await this.usersService.createUser(createUserDto);
      return ok(result, 'User created successfully', 200);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'page', type: Number, description: 'The page number', required: false })
  @ApiQuery({ name: 'limit', type: Number, description: 'The number of users per page', required: false })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(@Query() paginationDto: PaginationDto) {
    const users = await this.usersService.findAllUsers(paginationDto);
    return ok(users, 'Users retrieved successfully');
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the user' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findUserById(@Param('id') id: string) {
    const user = await this.usersService.findUserById(id);
    if (!user) throw new NotFoundException('User not found.');
    return ok(user, 'User retrieved successfully');
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT)
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiParam({ name: 'id', description: 'The ID of the user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateUserById(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.usersService.updateUserById(id, dto);
    if (!user) throw new NotFoundException('User not found.');
    return ok(user, 'User updated successfully');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteUserById(@Param('id') id: string) {
    const user = await this.usersService.removeUserById(id);
    if (!user) throw new NotFoundException('User not found.');
    return ok(user, 'User deleted successfully');
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get user by slug' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @ApiParam({ name: 'slug', description: 'The slug of the user' })
  async getUserBySlug(@Param('slug') slug: string) {
    const user = await this.usersService.getUserBySlug(slug);
    if (!user) throw new NotFoundException('User not found.');
    return ok(user, 'User retrieved successfully');
  }
}
