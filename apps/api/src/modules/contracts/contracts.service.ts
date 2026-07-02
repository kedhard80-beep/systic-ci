import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ContractStatus, Prisma } from '@prisma/client';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationsService } from '../notifications/notifications.service';

export class CreateContractDto {
  @ApiProperty() @IsString() clientId: string;
  @ApiProperty() @IsString() titre: string;
  @ApiProperty() @IsDateString() startDate: string;
  @ApiProperty() @IsDateString() endDate: string;
  @ApiProperty() @IsNumber() @Min(0) montantHT: number;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() typeContrat?: string;
  @ApiPropertyOptional() @IsOptional() quoteId?: string;
}

@Injectable()
export class ContractsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private generateReference(): string {
    const year = new Date().getFullYear();
    const rand = String(Math.floor(Math.random() * 9000) + 1000);
    return `CTR-${year}-${rand}`;
  }

  async findAll(
    tenantId: string,
    params: { page?: number; limit?: number; status?: ContractStatus; clientId?: string },
  ) {
    const { page = 1, limit = 20, status, clientId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ContractWhereInput = {
      tenantId,
      ...(status && { status }),
      ...(clientId && { clientId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.contract.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          client: { select: { id: true, nom: true, entreprise: true } },
          _count: { select: { interventions: true, invoices: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contract.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id, tenantId },
      include: {
        client: true,
        quote: true,
        interventions: { select: { id: true, reference: true, status: true, scheduledAt: true } },
        invoices: { select: { id: true, reference: true, status: true, totalTTC: true } },
      },
    });
    if (!contract) throw new NotFoundException(`Contrat ${id} introuvable`);
    return contract;
  }

  async create(tenantId: string, userId: string, dto: CreateContractDto) {
    const tvaRate = 0.18;
    const montantTVA = dto.montantHT * tvaRate;
    const montantTTC = dto.montantHT + montantTVA;

    const contract = await this.prisma.contract.create({
      data: {
        tenantId,
        clientId: dto.clientId,
        createdById: userId,
        reference: this.generateReference(),
        titre: dto.titre,
        status: ContractStatus.ACTIF,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        montantHT: dto.montantHT,
        montantTVA,
        montantTTC,
        description: dto.description,
        typeContrat: dto.typeContrat,
        ...(dto.quoteId && { quoteId: dto.quoteId }),
      },
      include: { client: { select: { nom: true } } },
    });

    // Alert 30 days before expiry via scheduled job
    await this.notifications.create({
      tenantId,
      userId,
      type: 'CONTRACT_CREATED',
      title: 'Contrat créé',
      body: `Contrat ${contract.reference} — ${(contract.client as any).nom} créé avec succès.`,
      metadata: { contractId: contract.id },
    });

    return contract;
  }

  async updateStatus(id: string, tenantId: string, status: ContractStatus) {
    await this.findOne(id, tenantId);
    return this.prisma.contract.update({ where: { id }, data: { status } });
  }

  async getExpiringContracts(tenantId: string, daysAhead = 30) {
    const now = new Date();
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + daysAhead);

    return this.prisma.contract.findMany({
      where: {
        tenantId,
        status: ContractStatus.ACTIF,
        endDate: { gte: now, lte: threshold },
      },
      include: { client: { select: { nom: true, email: true, telephone: true } } },
      orderBy: { endDate: 'asc' },
    });
  }

  async getStats(tenantId: string) {
    const [total, actifs, expireBientot, parStatut] = await Promise.all([
      this.prisma.contract.count({ where: { tenantId } }),
      this.prisma.contract.count({ where: { tenantId, status: ContractStatus.ACTIF } }),
      this.getExpiringContracts(tenantId, 30).then((r) => r.length),
      this.prisma.contract.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true,
        _sum: { montantTTC: true },
      }),
    ]);

    return { total, actifs, expireBientot, parStatut };
  }
}
