import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTechnicienDto {
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) specialite?: string[];
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) certifications?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() vehicule?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() gpsEnabled?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isAvailable?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() zone?: string;
}

@Injectable()
export class TechniciensService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    params: { page?: number; limit?: number; available?: boolean; zone?: string },
  ) {
    const { page = 1, limit = 50, available, zone } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.TechnicienWhereInput = {
      user: { tenantId },
      ...(available !== undefined && { isAvailable: available }),
      ...(zone && { zone }),
    };

    const [data, total] = await Promise.all([
      this.prisma.technicien.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatarUrl: true,
              isActive: true,
            },
          },
          _count: { select: { interventions: true } },
        },
        orderBy: { user: { lastName: 'asc' } },
      }),
      this.prisma.technicien.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const tech = await this.prisma.technicien.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        interventions: {
          take: 10,
          orderBy: { assignedAt: 'desc' },
          include: {
            intervention: {
              select: {
                id: true,
                reference: true,
                type: true,
                status: true,
                scheduledAt: true,
                client: { select: { nom: true } },
              },
            },
          },
        },
      },
    });
    if (!tech) throw new NotFoundException(`Technicien ${id} introuvable`);
    return tech;
  }

  async findByUserId(userId: string) {
    const tech = await this.prisma.technicien.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true, firstName: true, lastName: true, email: true, phone: true,
          },
        },
      },
    });
    if (!tech) throw new NotFoundException('Profil technicien introuvable');
    return tech;
  }

  async update(id: string, dto: UpdateTechnicienDto) {
    await this.findOne(id);
    return this.prisma.technicien.update({ where: { id }, data: dto });
  }

  async setAvailability(id: string, isAvailable: boolean) {
    return this.prisma.technicien.update({
      where: { id },
      data: { isAvailable },
    });
  }

  async getPlanning(technicienId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    return this.prisma.intervention.findMany({
      where: {
        techniciens: { some: { technicienId } },
        scheduledAt: { gte: start, lte: end },
      },
      include: {
        client: { select: { nom: true, adresse: true, telephone: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getStats(technicienId: string) {
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, thisMonth, completed, pending] = await Promise.all([
      this.prisma.intervention.count({
        where: { techniciens: { some: { technicienId } } },
      }),
      this.prisma.intervention.count({
        where: {
          techniciens: { some: { technicienId } },
          scheduledAt: { gte: startMonth },
        },
      }),
      this.prisma.intervention.count({
        where: {
          techniciens: { some: { technicienId } },
          status: 'TERMINEE',
        },
      }),
      this.prisma.intervention.count({
        where: {
          techniciens: { some: { technicienId } },
          status: { in: ['PLANIFIEE', 'EN_ROUTE', 'EN_COURS'] },
        },
      }),
    ]);

    return { total, thisMonth, completed, pending };
  }
}
