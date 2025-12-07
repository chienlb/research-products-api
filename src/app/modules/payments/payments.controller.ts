import { Controller, Get, Post, Body, Query, Req, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import type { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post('create')
  async create(@Body() dto: CreatePaymentDto, @Req() req: Request) {
    return this.paymentsService.createPayment(dto, req);
  }

  @Get('return')
  async handleReturn(@Query() query: any) {
    const result = await this.paymentsService.handleReturn(query);

    if (!result.success) {
      throw new BadRequestException(result.message);
    }

    return {
      success: true,
      message: result.message,
      data: result.data,
    };
  }

  @Post('webhook')
  async handleWebhook(@Query() query: any) {
    const result = await this.paymentsService.handleWebhook(query);
    return result;
  }
}
