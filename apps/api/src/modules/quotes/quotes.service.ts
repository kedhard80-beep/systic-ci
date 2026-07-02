import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { Prisma, QuoteStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class QuotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private generateReference(): string {
    const year = new Date().getFullYear();
    const rand = Math.floor(Math.random() * 9000) + 1000;
    return `DEV-${year}-${rand}`;
  }

  async findAll(
    tenantId: string,
    params: {
      page?: number;
      limit?: number;
      status?: QuoteStatus;
      clientId?: string;
    },
  ) {
    const { page = 1, limit = 20, status, clientId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.QuoteWhereInput = {
      tenantId,
      ...(status && { status }),
      ...(clientId && { clientId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.quote.findMany({
        where,
        skip,
        take: limit,
        include: {
          client: { select: { id: true, nom: true, entreprise: true } },
          items: true,
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.quote.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, tenantId },
      include: {
        client: true,
        items: true,
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!quote) throw new NotFoundException(`Devis ${id} introuvable`);
    return quote;
  }

  async create(tenantId: string, userId: string, dto: CreateQuoteDto) {
    // Calculate totals
    const totalHT = dto.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const totalTVA = totalHT * (dto.tvaRate ?? 0.18);
    const totalTTC = totalHT + totalTVA;

    const quote = await this.prisma.quote.create({
      data: {
        tenantId,
        clientId: dto.clientId,
        createdById: userId,
        reference: this.generateReference(),
        status: QuoteStatus.BROUILLON,
        validUntil: dto.validUntil ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        tvaRate: dto.tvaRate ?? 0.18,
        totalHT,
        totalTVA,
        totalTTC,
        notes: dto.notes,
        items: {
          create: dto.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            tvaRate: dto.tvaRate ?? 0.18,
            totalHT: item.unitPrice * item.quantity,
          })),
        },
      },
      include: { items: true, client: true },
    });

    return quote;
  }

  async updateStatus(
    id: string,
    tenantId: string,
    status: QuoteStatus,
    userId: string,
  ) {
    const quote = await this.findOne(id, tenantId);

    const TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
      [QuoteStatus.BROUILLON]: [QuoteStatus.ENVOYE],
      [QuoteStatus.ENVOYE]: [QuoteStatus.VU, QuoteStatus.ACCEPTE, QuoteStatus.REFUSE, QuoteStatus.EXPIRE],
      [QuoteStatus.VU]: [QuoteStatus.EN_NEGOCIATION, QuoteStatus.ACCEPTE, QuoteStatus.REFUSE],
      [QuoteStatus.EN_NEGOCIATION]: [QuoteStatus.ACCEPTE, QuoteStatus.REFUSE],
      [QuoteStatus.ACCEPTE]: [QuoteStatus.CONVERTI],
      [QuoteStatus.REFUSE]: [],
      [QuoteStatus.EXPIRE]: [],
      [QuoteStatus.CONVERTI]: [],
    };

    const allowed = TRANSITIONS[quote.status as QuoteStatus];
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Transition ${quote.status} → ${status} non autorisée`,
      );
    }

    const updated = await this.prisma.quote.update({
      where: { id },
      data: {
        status,
        ...(status === QuoteStatus.ENVOYE && { sentAt: new Date() }),
        ...(status === QuoteStatus.ACCEPTE && { acceptedAt: new Date() }),
      },
    });

    // If accepted → notify commercial
    if (status === QuoteStatus.ACCEPTE) {
      await this.notifications.create({
        tenantId,
        userId,
        type: 'QUOTE_ACCEPTED',
        title: 'Devis accepté !',
        body: `Le devis ${quote.reference} a été accepté par ${(quote as any).client?.nom}`,
        metadata: { quoteId: id },
      });
    }

    return updated;
  }

  async convertToContract(id: string, tenantId: string, userId: string) {
    const quote = await this.findOne(id, tenantId);
    if (quote.status !== QuoteStatus.ACCEPTE) {
      throw new BadRequestException('Seul un devis accepté peut être converti en contrat');
    }

    const [contract] = await this.prisma.$transaction([
      this.prisma.contract.create({
        data: {
          tenantId,
          clientId: quote.clientId,
          quoteId: quote.id,
          createdById: userId,
          reference: `CTR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
          status: 'ACTIF',
          titre: `Contrat issu du devis ${quote.reference}`,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          montantTTC: quote.totalTTC,
          montantHT: quote.totalHT,
          montantTVA: quote.totalTVA,
        },
      }),
      this.prisma.quote.update({
        where: { id },
        data: { status: QuoteStatus.CONVERTI },
      }),
    ]);

    return contract;
  }

  async getStats(tenantId: string) {
    const [total, montant, parStatut] = await Promise.all([
      this.prisma.quote.count({ where: { tenantId } }),
      this.prisma.quote.aggregate({
        where: { tenantId, status: { in: [QuoteStatus.ENVOYE, QuoteStatus.ACCEPTE] } },
        _sum: { totalTTC: true },
      }),
      this.prisma.quote.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true,
      }),
    ]);

    return { total, montantPipeline: montant._sum.totalTTC ?? 0, parStatut };
  }
}
