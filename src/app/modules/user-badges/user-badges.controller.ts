import { BadRequestException, Body, Controller, Get, Post, Put, Query, Param, Delete } from '@nestjs/common';
import { UserBadgesService } from './user-badges.service';
import { CreateUserBadgeDto } from './dto/create-user-badge.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UserBadgeDocument } from './schema/user-badge.schema';
import { UpdateUserBadgeDto } from './dto/update-user-badge.dto';
import { ok } from 'assert';
import { PaginationDto } from '../pagination/pagination.dto';

@Controller('user-badges')
@ApiTags('User Badges')
@ApiBearerAuth()
export class UserBadgesController {
  constructor(private readonly userBadgesService: UserBadgesService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new user badge' })
  @ApiBody({ type: CreateUserBadgeDto, description: 'The user badge to create', examples: { example1: { value: { userId: '1234567890', badgeId: '1234567890', awardedAt: new Date(), reason: 'Reason for awarding the badge', awardedBy: '1234567890', isRevoked: false, revokedAt: null, note: 'Note for the badge' } } } })
  @ApiResponse({ status: 201, description: 'The user badge has been successfully created.', type: CreateUserBadgeDto })
  @ApiResponse({ status: 400, description: 'Bad Request', type: BadRequestException })
  async createUserBadge(@Body() createUserBadgeDto: CreateUserBadgeDto): Promise<UserBadgeDocument> {
    return this.userBadgesService.createUserBadge(createUserBadgeDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user badge by ID' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the user badge' })
  @ApiResponse({ status: 200, description: 'The user badge has been successfully retrieved.', type: CreateUserBadgeDto })
  @ApiResponse({ status: 400, description: 'Bad Request', type: BadRequestException })
  async findUserBadgeById(@Param('id') id: string): Promise<CreateUserBadgeDto> {
    const userBadge = await this.userBadgesService.findUserBadgeById(id);
    return {
      userId: userBadge.userId.toString(),
      badgeId: userBadge.badgeId.toString(),
      awardedAt: userBadge.awardedAt,
      reason: userBadge.reason,
      awardedBy: userBadge.awardedBy?.toString(),
      isRevoked: userBadge.isRevoked,
      revokedAt: userBadge.revokedAt,
      note: userBadge.note,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all user badges' })
  @ApiQuery({ name: 'page', type: Number, description: 'The page number', required: false })
  @ApiQuery({ name: 'limit', type: Number, description: 'The number of items per page', required: false })
  @ApiResponse({ status: 200, description: 'The user badges have been successfully retrieved.', type: [CreateUserBadgeDto] })
  @ApiResponse({ status: 400, description: 'Bad Request', type: BadRequestException })
  async findAllUserBadges(@Query() paginationDto: PaginationDto) {
    const result = await this.userBadgesService.findAllUserBadges(paginationDto);
    return result;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user badge by ID' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the user badge' })
  @ApiBody({ type: UpdateUserBadgeDto, description: 'The user badge to update', examples: { example1: { value: { userId: '1234567890', badgeId: '1234567890', awardedAt: new Date(), reason: 'Reason for awarding the badge', awardedBy: '1234567890', isRevoked: false, revokedAt: null, note: 'Note for the badge' } } } })
  @ApiResponse({ status: 200, description: 'The user badge has been successfully updated.', type: CreateUserBadgeDto })
  @ApiResponse({ status: 400, description: 'Bad Request', type: BadRequestException })
  async updateUserBadgeById(@Param('id') id: string, @Body() updateUserBadgeDto: UpdateUserBadgeDto): Promise<CreateUserBadgeDto> {
    const userBadge = await this.userBadgesService.updateUserBadge(id, updateUserBadgeDto);
    return {
      userId: userBadge.userId.toString(),
      badgeId: userBadge.badgeId.toString(),
      awardedAt: userBadge.awardedAt,
      reason: userBadge.reason,
      awardedBy: userBadge.awardedBy?.toString(),
      isRevoked: userBadge.isRevoked,
      revokedAt: userBadge.revokedAt,
      note: userBadge.note,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user badge by ID' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the user badge' })
  @ApiResponse({ status: 200, description: 'The user badge has been successfully deleted.', type: CreateUserBadgeDto })
  @ApiResponse({ status: 400, description: 'Bad Request', type: BadRequestException })
  async deleteUserBadgeById(@Param('id') id: string): Promise<void> {
    await this.userBadgesService.deleteUserBadge(id);
    return ok('User badge deleted successfully');
  }

  @Post(':id/revoke')
  @ApiOperation({ summary: 'Revoke a user badge by ID' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the user badge' })
  @ApiResponse({ status: 200, description: 'The user badge has been successfully revoked.', type: CreateUserBadgeDto })
  @ApiResponse({ status: 400, description: 'Bad Request', type: BadRequestException })
  async revokeUserBadgeById(@Param('id') id: string): Promise<void> {
    return this.userBadgesService.revokeUserBadge(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a user badge by ID' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the user badge' })
  @ApiResponse({ status: 200, description: 'The user badge has been successfully restored.', type: CreateUserBadgeDto })
  @ApiResponse({ status: 400, description: 'Bad Request', type: BadRequestException })
  async restoreUserBadgeById(@Param('id') id: string): Promise<void> {
    return this.userBadgesService.restoreUserBadge(id);
  }

  @Get(':userId/user-badges')
  @ApiOperation({ summary: 'Get all user badges by user ID' })
  @ApiParam({ name: 'userId', type: String, description: 'The ID of the user' })
  @ApiQuery({ name: 'page', type: Number, description: 'The page number', required: false })
  @ApiQuery({ name: 'limit', type: Number, description: 'The number of items per page', required: false })
  @ApiResponse({ status: 200, description: 'The user badges have been successfully retrieved.', type: [CreateUserBadgeDto] })
  @ApiResponse({ status: 400, description: 'Bad Request', type: BadRequestException })
  async findUserBadgesByUserId(@Param('userId') userId: string, @Query() paginationDto: PaginationDto) {
    const result = await this.userBadgesService.findUserBadgesByUserId(userId, paginationDto);
    return result;
  }
}