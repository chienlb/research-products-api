import {
  Controller,
  Post,
  Body,
  Logger,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InvitationCodesService } from './invitation-codes.service';
import { CreateInvitationCodeDto } from './dto/create-invitation-code.dto';
import mongoose from 'mongoose';
import { ok } from 'src/app/common/response/api-response';
import { PaginationDto } from '../pagination/pagination.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../users/schema/user.schema';
import { Roles } from 'src/app/common/decorators/role.decorator';

@ApiTags('Invitation Codes')
@ApiBearerAuth()
@Controller('invitation-codes')
@UseGuards(AuthGuard('jwt'))
@Roles(UserRole.ADMIN)
export class InvitationCodesController {
  private readonly logger = new Logger(InvitationCodesController.name);

  constructor(
    private readonly invitationCodesService: InvitationCodesService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new invitation code' })
  @ApiBody({
    type: CreateInvitationCodeDto,
    description: 'The invitation code to create',
    examples: {
      example1: {
        value: {
          code: 'INVITE',
          totalUses: 10,
          startedAt: new Date(),
          createdBy: '1234567890',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The invitation code has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(@Body() createInvitationCodeDto: CreateInvitationCodeDto) {
    this.logger.log(
      `Creating invitation code by user: ${createInvitationCodeDto.createdBy}`,
    );
    const result = await this.invitationCodesService.createInvitationCode(
      createInvitationCodeDto,
    );
    return ok(result.data, 'Invitation code created successfully', 200);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an invitation code by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The ID of the invitation code',
  })
  @ApiResponse({
    status: 200,
    description: 'The invitation code has been successfully retrieved.',
    type: CreateInvitationCodeDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findById(@Param('id') id: string) {
    const result = await this.invitationCodesService.findInvitationCodeById(id);
    return ok(result, 'Invitation code found successfully', 200);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invitation codes' })
  @ApiQuery({
    name: 'page',
    type: Number,
    description: 'The page number',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    description: 'The number of items per page',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'The invitation codes have been successfully retrieved.',
    type: CreateInvitationCodeDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findAll(@Query() paginationDto: PaginationDto) {
    const result =
      await this.invitationCodesService.findAllInvitationCodes(paginationDto);
    return ok(result, 'Invitation codes found successfully', 200);
  }
}
