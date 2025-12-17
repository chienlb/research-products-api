import { Controller, Post, Body, Logger, Param, Delete, Get, Put, Query } from '@nestjs/common';
import { HistoryInvitationsService } from './history-invitations.service';
import { CreateHistoryInvitationDto } from './dto/create-history-invitation.dto';
import mongoose from 'mongoose';
import { ok } from 'src/app/common/response/api-response';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';
import { PaginationDto } from '../pagination/pagination.dto';
import { UpdateHistoryInvitationDto } from './dto/update-history-invitation.dto';

@Controller('history-invitations')
@ApiTags('History Invitations')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class HistoryInvitationsController {
  private readonly logger = new Logger(HistoryInvitationsController.name);

  constructor(
    private readonly historyInvitationsService: HistoryInvitationsService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new history invitation' })
  @ApiBody({
    type: CreateHistoryInvitationDto,
    description: 'The history invitation to create',
    examples: {
      example1: {
        value: {
          userId: '1234567890',
          code: 'INVITE',
          invitedAt: new Date(),
          status: 'accepted',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'History invitation created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(@Body() createHistoryInvitationDto: CreateHistoryInvitationDto) {
    this.logger.log(
      `Creating history invitation for user: ${createHistoryInvitationDto.userId}`,
    );
    const result = await this.historyInvitationsService.createHistoryInvitation(
      createHistoryInvitationDto,
    );
    return ok(result, 'History invitation created successfully', 200);
  }

  @Get()
  @ApiOperation({ summary: 'Get all history invitations' })
  @ApiResponse({ status: 200, description: 'History invitations fetched successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findAll(@Query() paginationDto: PaginationDto) {
    const result = await this.historyInvitationsService.findAllHistoryInvitations(paginationDto);
    return ok(result, 'History invitations fetched successfully', 200);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a history invitation by id' })
  @ApiResponse({ status: 200, description: 'History invitation fetched successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findOne(@Param('id') id: string) {
    const result = await this.historyInvitationsService.findOneHistoryInvitation(id);
    return ok(result, 'History invitation fetched successfully', 200);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a history invitation by id' })
  @ApiResponse({ status: 200, description: 'History invitation updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async update(@Param('id') id: string, @Body() updateHistoryInvitationDto: UpdateHistoryInvitationDto) {
    const result = await this.historyInvitationsService.updateHistoryInvitation(id, updateHistoryInvitationDto);
    return ok(result, 'History invitation updated successfully', 200);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a history invitation by id' })
  @ApiResponse({ status: 200, description: 'History invitation deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async delete(@Param('id') id: string) {
    const result = await this.historyInvitationsService.remove(id);
    return ok(result, 'History invitation deleted successfully', 200);
  }
}
