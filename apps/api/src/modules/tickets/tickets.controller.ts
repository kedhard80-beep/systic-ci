import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TicketsService, CreateTicketDto, CreateMessageDto } from './tickets.service';
import { UserRole, TicketStatus, TicketPriority } from '@prisma/client';

@ApiTags('Tickets Support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly svc: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des tickets' })
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: TicketStatus,
    @Query('priority') priority?: TicketPriority,
  ) {
    return this.svc.findAll(tenantId, userId, userRole, {
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
      status,
      priority,
    });
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
  getStats(@CurrentUser('tenantId') tenantId: string) {
    return this.svc.getStats(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail ticket + messages' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.svc.findOne(id, tenantId, userId, userRole);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un ticket' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTicketDto,
  ) {
    return this.svc.create(tenantId, userId, dto);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Ajouter un message au ticket' })
  addMessage(
    @Param('id') ticketId: string,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() dto: CreateMessageDto,
  ) {
    return this.svc.addMessage(ticketId, tenantId, userId, userRole, dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL, UserRole.TECHNICIEN)
  @ApiOperation({ summary: 'Mettre à jour le statut du ticket' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body('status') status: TicketStatus,
  ) {
    return this.svc.updateStatus(id, tenantId, status);
  }

  @Patch(':id/assign')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
  @ApiOperation({ summary: 'Assigner le ticket' })
  assign(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body('assignedToId') assignedToId: string,
  ) {
    return this.svc.assign(id, tenantId, assignedToId);
  }
}
