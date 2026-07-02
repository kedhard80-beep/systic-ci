import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { IsDateString, IsNumber, IsOptional, IsString, Min, ValidateNested, IsArray, IsPositive } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { NotificationsService } from '../notifications/notifications.service';

export class InvoiceItemDto {
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsNumber() @IsPositive() quantity: number;
  @ApiProperty() @IsNumber() @Min(0) unitPrice: number;
}

export class CreateInvoiceDto {
  @ApiProperty() @IsString() clientId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contractId?: string;
  @ApiProperty({ type: [InvoiceItemDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => InvoiceItemDto) items: InvoiceItemDto[];
  @ApiPropertyOptional() @IsOptional() @IsDateString() dueDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) tvaRate?: number;
}

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private generateReference(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const rand = String(Math.floor(Math.random() * 9000) + 1000);
    return `FAC-${year}${month}-${rand}`;
  }

  async findAll(
    tenantId: string,
    params: { page?: number; limit?: number; status?: InvoiceStatus; clientId?: string },
  ) {
    const { page = 1, limit = 20, status, clientId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {
      tenantId,
      ...(status && { status }),
      ...(clientId && { clientId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          client: { select: { id: true, nom: true, entreprise: true } },
          contract: { select: { id: true, reference: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        client: true,
        contract: true,
        items: true,
        payments: true,
      },
    });
    if (!invoice) throw new NotFoundException(`Facture ${id} introuvable`);
    return invoice;
  }

  async create(tenantId: string, userId: string, dto: CreateInvoiceDto) {
    const tvaRate = dto.tvaRate ?? 0.18;
    const totalHT = dto.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const totalTVA = totalHT * tvaRate;
    const totalTTC = totalHT + totalTVA;

    const dueDate = dto.dueDate
      ? new Date(dto.dueDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default

    const invoice = await this.prisma.invoice.create({
      data: {
        tenantId,
        clientId: dto.clientId,
        createdById: userId,
        reference: this.generateReference(),
        status: InvoiceStatus.BROUILLON,
        totalHT,
        totalTVA,
        totalTTC,
        tvaRate,
        dueDate,
        notes: dto.notes,
        ...(dto.contractId && { contractId: dto.contractId }),
        items: {
          create: dto.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalHT: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: true, client: { select: { nom: true } } },
    });

    return invoice;
  }

  async send(id: string, tenantId: string) {
    const invoice = await this.findOne(id, tenantId);
    if (invoice.status !== InvoiceStatus.BROUILLON) {
      throw new BadRequestException('Seules les factures en brouillon peuvent être envoyées');
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.ENVOYEE, sentAt: new Date() },
    });

    await this.notifications.create({
      tenantId,
      userId: invoice.clientId, // notify client
      type: 'INVOICE_SENT',
      title: 'Nouvelle facture',
      body: `Facture ${invoice.reference} de ${invoice.totalTTC.toLocaleString('fr-CI')} FCFA disponible.`,
      metadata: { invoiceId: id },
    });

    return updated;
  }

  async markPaid(id: string, tenantId: string, paymentRef?: string) {
    const invoice = await this.findOne(id, tenantId);
    if (invoice.status === InvoiceStatus.PAYEE) {
      throw new BadRequestException('Facture déjà payée');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.PAYEE,
        paidAt: new Date(),
        ...(paymentRef && { paymentRef }),
      },
    });
  }

  async getOverdue(tenantId: string) {
    return this.prisma.invoice.findMany({
      where: {
        tenantId,
        status: { in: [InvoiceStatus.ENVOYEE, InvoiceStatus.EN_RETARD] },
        dueDate: { lt: new Date() },
      },
      include: { client: { select: { nom: true, email: true, telephone: true } } },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getStats(tenantId: string) {
    const startOfMonth = new Date(new Date().setDate(1));

    const [total, cesMois, ca, parStatut] = await Promise.all([
      this.prisma.invoice.count({ where: { tenantId } }),
      this.prisma.invoice.count({ where: { tenantId, createdAt: { gte: startOfMonth } } }),
      this.prisma.invoice.aggregate({
        where: { tenantId, status: InvoiceStatus.PAYEE },
        _sum: { totalTTC: true },
      }),
      this.prisma.invoice.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true,
        _sum: { totalTTC: true },
      }),
    ]);

    return { total, cesMois, caEnCaisse: ca._sum.totalTTC ?? 0, parStatut };
  }
}
