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
}
