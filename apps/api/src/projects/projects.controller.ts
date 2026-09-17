import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';


@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @Get()
  findAll(@Request() req: any) {
    return this.projectsService.findAllForUser(req.user.userId);
  }

  @Post()
  create(@Request() req: any, @Body() body: { name: string }) {
    if (!body.name) {
      throw new Error('Name is required');
    }
    return this.projectsService.create(req.user.userId, body.name);
  }

  @Get(':id/schema')
  async getSchema(@Request() req: any, @Param('id') id: string) {
    const schema = await this.projectsService.getSchemaForProject(id, req.user.userId);
    return schema || { sqlCode: '', cardinalityMap: {} };
  }

  @Put(':id/schema')
  async saveSchema(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { sqlCode: string; cardinalityMap: any }
  ) {
    const payload = { sqlCode: body.sqlCode, cardinalityMap: body.cardinalityMap };
    await this.projectsService.saveSchemaForProject(id, req.user.userId, payload);
    return { success: true };
  }
}
