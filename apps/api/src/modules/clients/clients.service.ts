import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Prisma, ActivityType } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      secteur?: string;
    },
  ) {
    const { page = 1, limit = 20, search, secteur } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ClientWhereInput = {
      tenantId,
      deletedAt: null,
      ...(search && {
        OR: [
          { nom: { contains: search, mode: 'insensitive' } },
          { entreprise: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(secteur && { secteur }),
    };

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          contacts: { take: 1, where: { isPrimary: true } },
          _count: {
            select: {
              quotes: true,
              contracts: true,
              interventions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        contacts: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        quotes: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, reference: true, status: true, totalTTC: true, createdAt: true },
        },
        contracts: {
          where: { status: 'ACTIF' },
          select: { id: true, reference: true, startDate: true, endDate: true, montantTTC: true },
        },
        interventions: {
          orderBy: { scheduledAt: 'desc' },
          take: 5,
          select: { id: true, reference: true, type: true, status: true, scheduledAt: true },
        },
      },
    });

    if (!client) throw new NotFoundException(`Client ${id} introuvable`);
    return client;
  }

  async create(tenantId: string, userId: string, dto: CreateClientDto) {
    // Check email uniqueness within tenant
    if (dto.email) {
      const existing = await this.prisma.client.findFirst({
        where: { email: dto.email, tenantId, deletedAt: null },
      });
      if (existing) {
        throw new ConflictException(`Un client avec l'email ${dto.email} existe déjà`);
      }
    }

    const client = await this.prisma.client.create({
      data: { ...dto, tenantId } as Prisma.ClientUncheckedCreateInput,
    });

    await this.prisma.activity.create({
      data: {
        clientId: client.id,
        type: ActivityType.NOTE,
        subject: 'Client créé',
        date: new Date(),
        createdBy: userId,
      },
    });

    return client;
  }

  async update(id: string, tenantId: string, userId: string, dto: UpdateClientDto) {
    await this.findOne(id, tenantId);

    const client = await this.prisma.client.update({
      where: { id },
      data: { ...dto },
    });

    await this.prisma.activity.create({
      data: {
        clientId: id,
        type: ActivityType.NOTE,
        subject: 'Fiche client mise à jour',
        date: new Date(),
        createdBy: userId,
      },
    });

    return client;
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.softDelete('client', { id });
  }

  async addActivity(
    clientId: string,
    tenantId: string,
    userId: string,
    type: string,
    description: string,
    metadata?: Record<string, unknown>,
  ) {
    await this.findOne(clientId, tenantId);
    return this.prisma.activity.create({
      data: {
        clientId,
        createdBy: userId,
        type: type as ActivityType,
        subject: description,
        date: new Date(),
        ...(metadata && { metadata: metadata as Prisma.InputJsonObject }),
      },
    });
  }

  async getStats(tenantId: string) {
    const [total, nouveaux, actifs] = await Promise.all([
      this.prisma.client.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.client.count({
        where: {
          tenantId,
          deletedAt: null,
          createdAt: { gte: new Date(new Date().setDate(1)) },
        },
      }),
      this.prisma.client.count({
        where: {
          tenantId,
          deletedAt: null,
          contracts: { some: { status: 'ACTIF' } },
        },
      }),
    ]);
    return { total, nouveaux, actifs };
  }
}
