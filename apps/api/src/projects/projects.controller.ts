import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
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
}
