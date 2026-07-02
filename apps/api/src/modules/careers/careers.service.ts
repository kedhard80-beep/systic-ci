import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationsService } from '../notifications/notifications.service';

export class CreateJobDto {
  @ApiProperty() @IsString() @MinLength(3) titre: string;
  @ApiProperty() @IsString() @MinLength(20) description: string;
  @ApiProperty() @IsString() departement: string;
  @ApiProperty() @IsString() localisation: string;
  @ApiProperty() @IsString() typeContrat: string;
  @ApiPropertyOptional() @IsOptional() @IsString() experience?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() remuneration?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() published?: boolean;
}

export class CreateApplicationDto {
  @ApiProperty() @IsString() jobId: string;
  @ApiProperty() @IsString() @MinLength(2) nom: string;
  @ApiProperty() @IsString() @MinLength(2) prenom: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() telephone: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cvUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(50) motivation?: string;
}

@Injectable()
export class CareersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async listJobs(
    tenantId: string,
    params: { page?: number; limit?: number; published?: boolean; departement?: string },
  ) {
    const { page = 1, limit = 20, published, departement } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.CareerWhereInput = {
      tenantId,
      ...(published !== undefined && { published }),
      ...(departement && { departement }),
    };

    const [data, total] = await Promise.all([
      this.prisma.career.findMany({
        where,
        skip,
        take: Number(limit),
        include: { _count: { select: { applications: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.career.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findJob(id: string, tenantId: string) {
    const job = await this.prisma.career.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { applications: true } } },
    });
    if (!job) throw new NotFoundException(`Offre ${id} introuvable`);
    return job;
  }

  async createJob(tenantId: string, userId: string, dto: CreateJobDto) {
    return this.prisma.career.create({
      data: {
        tenantId,
        createdById: userId,
        titre: dto.titre,
        description: dto.description,
        departement: dto.departement,
        localisation: dto.localisation,
        typeContrat: dto.typeContrat,
        experience: dto.experience,
        remuneration: dto.remuneration,
        published: dto.published ?? false,
      },
    });
  }

  async updateJob(id: string, tenantId: string, dto: Partial<CreateJobDto>) {
    await this.findJob(id, tenantId);
    return this.prisma.career.update({ where: { id }, data: dto });
  }

  async deleteJob(id: string, tenantId: string) {
    await this.findJob(id, tenantId);
    return this.prisma.career.delete({ where: { id } });
  }

  async apply(tenantId: string, dto: CreateApplicationDto) {
    const job = await this.prisma.career.findFirst({ where: { id: dto.jobId, tenantId } });
    if (!job) throw new NotFoundException('Offre introuvable');

    const application = await this.prisma.application.create({
      data: {
        tenantId,
        careerId: dto.jobId,
        nom: dto.nom,
        prenom: dto.prenom,
        email: dto.email.toLowerCase(),
        telephone: dto.telephone,
        cvUrl: dto.cvUrl,
        motivation: dto.motivation,
        status: 'RECU',
      },
    });

    await this.notifications.create({
      tenantId,
      userId: 'system',
      type: 'APPLICATION_RECEIVED',
      title: 'Nouvelle candidature',
      body: `${dto.prenom} ${dto.nom} a postulé pour ${job.titre}`,
      metadata: { applicationId: application.id, jobId: dto.jobId },
    });

    return application;
  }

  async listApplications(
    tenantId: string,
    jobId: string,
    params: { page?: number; limit?: number },
  ) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.application.findMany({
        where: { careerId: jobId },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.application.count({ where: { careerId: jobId } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
