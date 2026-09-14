import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller('api/v1')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
