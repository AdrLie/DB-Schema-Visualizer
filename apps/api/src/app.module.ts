import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { DbConnectorModule } from './db-connector/db-connector.module.js';

@Module({
  imports: [AuthModule, ProjectsModule, DbConnectorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
