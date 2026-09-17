import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { DbConnectorService } from './db-connector.service.js';
import type { DbConnectionDetails } from './db-connector.service.js';
// Using JwtAuthGuard if needed in the future, but leaving it public or optional for now
// import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('db-connector')
export class DbConnectorController {
  constructor(private readonly dbConnectorService: DbConnectorService) {}

  @Post('test')
  @HttpCode(HttpStatus.OK)
  async testConnection(@Body() body: DbConnectionDetails) {
    const isConnected = await this.dbConnectorService.testConnection(body);
    return { success: isConnected };
  }

  @Post('introspect')
  @HttpCode(HttpStatus.OK)
  async introspect(@Body() body: DbConnectionDetails) {
    const schema = await this.dbConnectorService.introspect(body);
    return schema;
  }

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  async executeSql(@Body() body: DbConnectionDetails & { sql: string }) {
    if (!body.sql) {
      return { success: false, message: 'SQL query is required' };
    }
    const result = await this.dbConnectorService.executeSql(body, body.sql);
    return { success: true, result };
  }
}
