import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller()
export class AppController {
  @Get()
  getHello(@Req() req: Request) {
    const ip =
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.headers['cf-connecting-ip'] ||
      req.socket.remoteAddress;

    return {
      message: 'Hello',
      ip,
    };
  }
}

