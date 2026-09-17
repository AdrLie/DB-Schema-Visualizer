import { Module } from '@nestjs/common';
import { DbConnectorController } from './db-connector.controller.js';
import { DbConnectorService } from './db-connector.service.js';

@Module({
  controllers: [DbConnectorController],
  providers: [DbConnectorService],
})
export class DbConnectorModule {}
