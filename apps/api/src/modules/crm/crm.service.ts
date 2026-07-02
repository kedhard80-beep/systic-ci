import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LeadStage, LeadSource, Prisma } from '@prisma/client';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';

// Stage ordering for pipeline display
const STAGE_ORDER: LeadStage[] = [
  LeadStage.PROSPECT,
  LeadStage.CONTACT,
  LeadStage.DEVIS,
  LeadStage.NEGOCIATION,
  LeadStage.GAGNE,
  LeadStage.PERDU,
];

@Injectable()
export class CrmService {
  constructor(private readonly prisma: PrismaService) {}

  // ===== LEADS LIST & PIPELINE =====

  async findAll(
    tenantId: string,
    params: {
      page?: number;
      limit?: number;
      stage?: LeadStage;
      source?: LeadSource;
      assignedTo?: string;
      search?: string;
    },
  ) {
    const { page = 1, limit = 50, stage, source, assignedTo, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {
      tenantId,
      ...(stage && { stage }),
      ...(source && { source }),
      ...(assignedTo && { assignedTo }),
      ...(search && {
        OR: [
          { nom: { contains: search, mode: 'insensitive' } },
          { entreprise: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  /**
   * Renvoie les leads regroupés par stage (vue Kanban)
   */
  async getPipeline(tenantId: string) {
    const leads = await this.prisma.lead.findMany({
      where: { tenantId, stage: { notIn: [LeadStage.GAGNE, LeadStage.PERDU] } },
      orderBy: { updatedAt: 'desc' },
    });

    const pipeline: Record<string, typeof leads> = {};
    for (const stage of STAGE_ORDER.filter(
      (s) => s !== LeadStage.GAGNE && s !== LeadStage.PERDU,
    )) {
      pipeline[stage] = leads.filter((l) => l.stage === stage);
    }

    // Totals per stage
    const totals: Record<string, number> = {};
    for (const [stage, items] of Object.entries(pipeline)) {
      totals[stage] = items.reduce((sum, l) => sum + (l.montant ?? 0), 0);
    }

    return { pipeline, totals };
  }

  async findOne(id: string, tenantId: string) {
    const lead = await this.prisma.lead.findFirst({ where: { id, tenantId } });
    if (!lead) throw new NotFoundException(`Lead ${id} introuvable`);
    return lead;
  }

  async create(tenantId: string, dto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: {
        tenantId,
        nom: dto.nom,
        entreprise: dto.entreprise,
        email: dto.email?.toLowerCase(),
        telephone: dto.telephone,
        montant: dto.montant,
        stage: dto.stage ?? LeadStage.PROSPECT,
        source: dto.source,
        assignedTo: dto.assignedTo,
        notes: dto.notes,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateLeadDto) {
    await this.findOne(id, tenantId);
    return this.prisma.lead.update({
      where: { id },
      data: {
        ...(dto.nom && { nom: dto.nom }),
        ...(dto.entreprise !== undefined && { entreprise: dto.entreprise }),
        ...(dto.email && { email: dto.email.toLowerCase() }),
        ...(dto.telephone !== undefined && { telephone: dto.telephone }),
        ...(dto.montant !== undefined && { montant: dto.montant }),
        ...(dto.source && { source: dto.source }),
        ...(dto.assignedTo !== undefined && { assignedTo: dto.assignedTo }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  /**
   * Déplace un lead vers un nouveau stage (drag & drop pipeline)
   */
  async moveStage(id: string, tenantId: string, stage: LeadStage) {
    await this.findOne(id, tenantId);
    const data: Prisma.LeadUpdateInput = { stage };
    if (stage === LeadStage.GAGNE || stage === LeadStage.PERDU) {
      data.closedAt = new Date();
    }
    return this.prisma.lead.update({ where: { id }, data });
  }

  async delete(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.lead.delete({ where: { id } });
  }

  /**
   * Crée un lead depuis le formulaire public du site web (sans auth).
   * Utilise le premier tenant (architecture single-tenant v1).
   */
  async createPublicLead(dto: {
    nom: string;
    email: string;
    telephone: string;
    entreprise?: string;
    services: string[];
    budget?: string;
    delai?: string;
    description: string;
  }) {
    const tenant = await this.prisma.tenant.findFirst({ where: { isActive: true } });
    if (!tenant) throw new Error('Tenant introuvable');

    const notes = [
      `Services demandés : ${dto.services.join(', ')}`,
      dto.budget ? `Budget estimé : ${dto.budget}` : null,
      dto.delai ? `Délai souhaité : ${dto.delai}` : null,
      `\nDescription :\n${dto.description}`,
    ]
      .filter(Boolean)
      .join('\n');

    return this.prisma.lead.create({
      data: {
        tenantId: tenant.id,
        nom: dto.nom,
        email: dto.email.toLowerCase(),
        telephone: dto.telephone,
        entreprise: dto.entreprise,
        stage: LeadStage.PROSPECT,
        source: LeadSource.SITE_WEB,
        notes,
      },
    });
  }

  // ===== STATS CRM =====

  async getStats(tenantId: string) {
    const [byStage, totalMontant, wonThisMonth, lostThisMonth] = await Promise.all([
      this.prisma.lead.groupBy({
        by: ['stage'],
        where: { tenantId },
        _count: true,
        _sum: { montant: true },
      }),
      this.prisma.lead.aggregate({
        where: { tenantId, stage: LeadStage.NEGOCIATION },
        _sum: { montant: true },
      }),
      this.prisma.lead.count({
        where: {
          tenantId,
          stage: LeadStage.GAGNE,
          closedAt: { gte: new Date(new Date().setDate(1)) },
        },
      }),
      this.prisma.lead.count({
        where: {
          tenantId,
          stage: LeadStage.PERDU,
          closedAt: { gte: new Date(new Date().setDate(1)) },
        },
      }),
    ]);

    const totalLeads = byStage.reduce((s, g) => s + g._count, 0);
    const won = byStage.find((g) => g.stage === LeadStage.GAGNE)?._count ?? 0;
    const conversionRate = totalLeads > 0 ? Math.round((won / totalLeads) * 100) : 0;

    return {
      byStage,
      pipeline: totalMontant._sum.montant ?? 0,
      conversionRate,
      wonThisMonth,
      lostThisMonth,
    };
  }
}
