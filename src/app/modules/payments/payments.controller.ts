import { Controller, Get, Post, Body, Query, Req, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import type { Request } from 'express';
import mongoose, { ClientSession } from 'mongoose';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { UserRole } from '../users/schema/user.schema';
import { UseGuards } from '@nestjs/common';
import { ok } from 'assert';

@Controller('payments')
@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post('create')
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiBody({
    description: 'Create a new payment',
    type: CreatePaymentDto,
  })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() dto: CreatePaymentDto, @Req() req: Request) {
    try {
      const result = await this.paymentsService.createPayment(dto, req);
      return ok(result, 'Payment created successfully');
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('return')
  @ApiOperation({ summary: 'Handle return payment' })
  @ApiQuery({ name: 'query', type: Object })
  @ApiResponse({ status: 200, description: 'Payment returned successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async handleReturn(@Query() query: any, @Req() req: Request) {
    try {
      const result = await this.paymentsService.handleReturn(query);
      return ok(result, 'Payment returned successfully');
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle webhook payment' })
  @ApiQuery({ name: 'query', type: Object })
  @ApiResponse({ status: 200, description: 'Payment webhook returned successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async handleWebhook(@Query() query: any, @Req() req: Request) {
    try {
      const result = await this.paymentsService.handleWebhook(query);
      return ok(result, 'Payment webhook returned successfully');
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
