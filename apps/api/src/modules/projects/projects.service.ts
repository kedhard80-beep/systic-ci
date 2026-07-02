import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectStatus, Priority, Prisma } from '@prisma/client';
import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() clientId: string;
  @ApiProperty() @IsDateString() startDate: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contractId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) budget?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() location?: string;
  @ApiPropertyOptional({ enum: Priority }) @IsOptional() @IsEnum(Priority) priority?: Priority;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiPropertyOptional({ enum: ProjectStatus }) @IsOptional() @IsEnum(ProjectStatus) status?: ProjectStatus;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(100) progress?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) spent?: number;
}

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  private generateReference(): string {
    const year = new Date().getFullYear();
    const rand = String(Math.floor(Math.random() * 9000) + 1000);
    return `PRJ-${year}-${rand}`;
  }

  async findAll(
    tenantId: string,
    params: { page?: number; limit?: number; status?: ProjectStatus; clientId?: string },
  ) {
    const { page = 1, limit = 20, status, clientId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      tenantId,
      ...(status && { status }),
      ...(clientId && { clientId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        include: {
          client: { select: { id: true, nom: true, entreprise: true } },
          techniciens: {
            include: {
              technicien: { include: { user: { select: { firstName: true, lastName: true } } } },
            },
          },
          _count: { select: { interventions: true, documents: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, tenantId },
      include: {
        client: true,
        contract: { select: { id: true, reference: true, montantTTC: true } },
        interventions: {
          orderBy: { scheduledAt: 'asc' },
          include: {
            techniciens: {
              include: { technicien: { include: { user: { select: { firstName: true, lastName: true } } } } },
            },
          },
        },
        techniciens: {
          include: {
            technicien: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
          },
        },
        documents: { orderBy: { createdAt: 'desc' }, take: 10 },
        media: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!project) throw new NotFoundException(`Projet ${id} introuvable`);
    return project;
  }

  async create(tenantId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        tenantId,
        reference: this.generateReference(),
        title: dto.title,
        description: dto.description,
        clientId: dto.clientId,
        contractId: dto.contractId,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        budget: dto.budget,
        location: dto.location,
        priority: dto.priority ?? Priority.NORMAL,
        status: ProjectStatus.EN_COURS,
      },
      include: {
        client: { select: { nom: true } },
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateProjectDto) {
    await this.findOne(id, tenantId);
    const { startDate, endDate, ...rest } = dto;
    return this.prisma.project.update({
      where: { id },
      data: {
        ...rest,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
      },
    });
  }

  async delete(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.project.update({
      where: { id },
      data: { status: ProjectStatus.ANNULE },
    });
  }

  async assignTechnicien(id: string, tenantId: string, technicienId: string, role?: string) {
    await this.findOne(id, tenantId);
    return this.prisma.projectTechnicien.upsert({
      where: { projectId_technicienId: { projectId: id, technicienId } },
      update: { role },
      create: { projectId: id, technicienId, role },
    });
  }
}
