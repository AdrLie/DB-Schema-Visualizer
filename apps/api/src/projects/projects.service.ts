import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAllForUser(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, name: string) {
    return this.prisma.project.create({
      data: {
        name,
        userId,
      },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.project.findFirst({
      where: { id, userId },
    });
  }

  async getSchemaForProject(projectId: string, userId: string) {
    const project = await this.findOne(projectId, userId);
    if (!project) return null;

    const schema = await this.prisma.schema.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    if (!schema || schema.versions.length === 0) return null;
    return schema.versions[0].payload;
  }

  async saveSchemaForProject(projectId: string, userId: string, payload: any) {
    const project = await this.findOne(projectId, userId);
    if (!project) throw new Error('Project not found');

    let schema = await this.prisma.schema.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });

    if (!schema) {
      schema = await this.prisma.schema.create({
        data: {
          name: 'Main Schema',
          projectId,
        },
      });
    }

    const lastVersion = await this.prisma.schemaVersion.findFirst({
      where: { schemaId: schema.id },
      orderBy: { version: 'desc' },
    });

    const nextVersionNum = lastVersion ? lastVersion.version + 1 : 1;

    return this.prisma.schemaVersion.create({
      data: {
        schemaId: schema.id,
        version: nextVersionNum,
        payload,
        canvas: {},
      },
    });
  }
}
