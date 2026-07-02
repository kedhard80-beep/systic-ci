import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { InterventionStatus, InterventionPriority, Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class InterventionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private generateReference(): string {
    const year = new Date().getFullYear();
    const rand = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0');
    return `INT-${year}-${rand}`;
  }

  async findAll(
    tenantId: string,
    params: {
      page?: number;
      limit?: number;
      status?: InterventionStatus;
      technicienId?: string;
      clientId?: string;
      from?: string;
      to?: string;
    },
  ) {
    const { page = 1, limit = 20, status, technicienId, clientId, from, to } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.InterventionWhereInput = {
      tenantId,
      ...(status && { status }),
      ...(clientId && { clientId }),
      ...(technicienId && {
        techniciens: { some: { technicienId } },
      }),
      ...(from && to && {
        scheduledAt: { gte: new Date(from), lte: new Date(to) },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.intervention.findMany({
        where,
        skip,
        take: limit,
        include: {
          client: { select: { id: true, nom: true, entreprise: true, adresse: true } },
          techniciens: {
            include: {
              technicien: {
                include: { user: { select: { firstName: true, lastName: true } } },
              },
            },
          },
          rapport: { select: { id: true, signedAt: true } },
        },
        orderBy: { scheduledAt: 'asc' },
      }),
      this.prisma.intervention.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const intervention = await this.prisma.intervention.findFirst({
      where: { id, tenantId },
      include: {
        client: true,
        techniciens: {
          include: {
            technicien: {
              include: { user: { select: { id: true, firstName: true, lastName: true, phone: true } } },
            },
          },
        },
        rapport: true,
        stockUsed: true,
        checklist: { orderBy: { order: 'asc' } },
      },
    });
    if (!intervention) throw new NotFoundException(`Intervention ${id} introuvable`);
    return intervention;
  }

  async create(tenantId: string, userId: string, dto: CreateInterventionDto) {
    const intervention = await this.prisma.intervention.create({
      data: {
        tenantId,
        clientId: dto.clientId,
        createdById: userId,
        reference: this.generateReference(),
        type: dto.type as any,
        status: InterventionStatus.PLANIFIEE,
        scheduledAt: new Date(dto.scheduledAt),
        estimatedDuration: dto.estimatedDuration,
        description: dto.description,
        adresse: dto.adresse,
        priority: (dto.priority as any) ?? InterventionPriority.NORMALE,
        ...(dto.technicienIds?.length && {
          techniciens: {
            create: dto.technicienIds.map((technicienId) => ({ technicienId })),
          },
        }),
      },
      include: {
        client: { select: { nom: true, telephone: true } },
        techniciens: { include: { technicien: true } },
      },
    });

    // Notify assigned technicians
    if (dto.technicienIds?.length) {
      for (const techId of dto.technicienIds) {
        await this.notifications.create({
          tenantId,
          userId: techId,
          type: 'INTERVENTION_ASSIGNED',
          title: 'Nouvelle mission assignée',
          body: `${intervention.type} chez ${(intervention.client as any).nom} le ${intervention.scheduledAt.toLocaleDateString('fr-CI')}`,
          metadata: { interventionId: intervention.id },
        });
      }
    }

    return intervention;
  }

  async updateStatus(
    id: string,
    tenantId: string,
    status: InterventionStatus,
    metadata?: Record<string, unknown>,
  ) {
    const intervention = await this.findOne(id, tenantId);

    const updated = await this.prisma.intervention.update({
      where: { id },
      data: {
        status,
        ...(status === InterventionStatus.EN_COURS && { startedAt: new Date() }),
        ...(status === InterventionStatus.TERMINEE && { completedAt: new Date() }),
        ...(metadata && { metadata: metadata as Prisma.InputJsonObject }),
      },
    });

    return updated;
  }

  async assignTechnicien(id: string, tenantId: string, technicienId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.interventionTechnicien.create({
      data: { interventionId: id, technicienId },
    });
  }

  async getCalendar(tenantId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    return this.prisma.intervention.findMany({
      where: { tenantId, scheduledAt: { gte: start, lte: end } },
      include: {
        client: { select: { nom: true } },
        techniciens: {
          include: { technicien: { include: { user: { select: { firstName: true } } } } },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getStats(tenantId: string) {
    const startOfMonth = new Date(new Date().setDate(1));

    const [total, cemois, parStatut, parType] = await Promise.all([
      this.prisma.intervention.count({ where: { tenantId } }),
      this.prisma.intervention.count({
        where: { tenantId, scheduledAt: { gte: startOfMonth } },
      }),
      this.prisma.intervention.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true,
      }),
      this.prisma.intervention.groupBy({
        by: ['type'],
        where: { tenantId },
        _count: true,
      }),
    ]);

    return { total, cemois, parStatut, parType };
  }
}
