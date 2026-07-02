import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TicketStatus, TicketPriority, Prisma, UserRole } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationsService } from '../notifications/notifications.service';

export class CreateTicketDto {
  @ApiProperty() @IsString() @MinLength(5) sujet: string;
  @ApiProperty() @IsString() @MinLength(20) description: string;
  @ApiPropertyOptional() @IsOptional() @IsString() categorie?: string;
  @ApiPropertyOptional({ enum: TicketPriority }) @IsOptional() @IsEnum(TicketPriority) priority?: TicketPriority;
  @ApiPropertyOptional() @IsOptional() @IsString() clientId?: string;
}

export class CreateMessageDto {
  @ApiProperty() @IsString() @MinLength(1) content: string;
  @ApiPropertyOptional() @IsOptional() isInternal?: boolean;
}

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private generateReference(): string {
    return `TKT-${Date.now().toString(36).toUpperCase()}`;
  }

  async findAll(
    tenantId: string,
    userId: string,
    userRole: UserRole,
    params: { page?: number; limit?: number; status?: TicketStatus; priority?: TicketPriority },
  ) {
    const { page = 1, limit = 20, status, priority } = params;
    const skip = (page - 1) * limit;

    // Clients see only their own tickets
    const isClient = userRole === UserRole.CLIENT;

    const where: Prisma.TicketWhereInput = {
      tenantId,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(isClient && { createdById: userId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        include: {
          createdBy: { select: { firstName: true, lastName: true } },
          assignedTo: { select: { firstName: true, lastName: true } },
          _count: { select: { messages: true } },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string, userId: string, userRole: UserRole) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, tenantId },
      include: {
        createdBy: { select: { firstName: true, lastName: true, avatarUrl: true } },
        assignedTo: { select: { firstName: true, lastName: true } },
        messages: {
          where: userRole === UserRole.CLIENT ? { isInternal: false } : {},
          include: { author: { select: { firstName: true, lastName: true, role: true, avatarUrl: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!ticket) throw new NotFoundException(`Ticket ${id} introuvable`);

    // Clients can only read their own tickets
    if (userRole === UserRole.CLIENT && ticket.createdById !== userId) {
      throw new ForbiddenException();
    }

    return ticket;
  }

  async create(tenantId: string, userId: string, dto: CreateTicketDto) {
    const ticket = await this.prisma.ticket.create({
      data: {
        tenantId,
        createdById: userId,
        ...(dto.clientId && { clientId: dto.clientId }),
        reference: this.generateReference(),
        sujet: dto.sujet,
        description: dto.description,
        categorie: dto.categorie,
        status: TicketStatus.OUVERT,
        priority: dto.priority ?? TicketPriority.NORMALE,
      },
    });

    // Notify support team
    await this.notifications.create({
      tenantId,
      userId, // Will be re-routed to support in production
      type: 'TICKET_CREATED',
      title: 'Nouveau ticket de support',
      body: `${ticket.sujet} — priorité ${ticket.priority}`,
      metadata: { ticketId: ticket.id },
    });

    return ticket;
  }

  async addMessage(
    ticketId: string,
    tenantId: string,
    authorId: string,
    userRole: UserRole,
    dto: CreateMessageDto,
  ) {
    const ticket = await this.findOne(ticketId, tenantId, authorId, userRole);

    if (ticket.status === TicketStatus.FERME) {
      throw new ForbiddenException('Le ticket est fermé');
    }

    const isInternal = userRole !== UserRole.CLIENT && (dto.isInternal ?? false);

    const message = await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        authorId,
        content: dto.content,
        isInternal,
      },
      include: { author: { select: { firstName: true, lastName: true, role: true, avatarUrl: true } } },
    });

    // Auto-update status to IN_PROGRESS if first agent reply
    if (userRole !== UserRole.CLIENT && ticket.status === TicketStatus.OUVERT) {
      await this.prisma.ticket.update({
        where: { id: ticketId },
        data: { status: TicketStatus.EN_COURS },
      });
    }

    return message;
  }

  async updateStatus(id: string, tenantId: string, status: TicketStatus) {
    await this.prisma.ticket.findFirst({ where: { id, tenantId } });
    return this.prisma.ticket.update({
      where: { id },
      data: {
        status,
        ...(status === TicketStatus.RESOLU && { resolvedAt: new Date() }),
        ...(status === TicketStatus.FERME && { closedAt: new Date() }),
      },
    });
  }

  async assign(id: string, tenantId: string, assignedToId: string) {
    return this.prisma.ticket.update({
      where: { id },
      data: { assignedToId, status: TicketStatus.EN_COURS },
    });
  }

  async getStats(tenantId: string) {
    const [total, parStatut, parPriority] = await Promise.all([
      this.prisma.ticket.count({ where: { tenantId } }),
      this.prisma.ticket.groupBy({ by: ['status'], where: { tenantId }, _count: true }),
      this.prisma.ticket.groupBy({ by: ['priority'], where: { tenantId }, _count: true }),
    ]);
    return { total, parStatut, parPriority };
  }
}
