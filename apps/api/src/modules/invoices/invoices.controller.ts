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
import { InvoicesService, CreateInvoiceDto } from './invoices.service';
import { UserRole, InvoiceStatus } from '@prisma/client';

@ApiTags('Factures')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly svc: InvoicesService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL, UserRole.CLIENT)
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: InvoiceStatus,
    @Query('clientId') clientId?: string,
  ) {
    return this.svc.findAll(tenantId, { page: page ? +page : 1, limit: limit ? +limit : 20, status, clientId });
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  getStats(@CurrentUser('tenantId') tenantId: string) {
    return this.svc.getStats(tenantId);
  }

  @Get('overdue')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
  @ApiOperation({ summary: 'Factures en retard de paiement' })
  getOverdue(@CurrentUser('tenantId') tenantId: string) {
    return this.svc.getOverdue(tenantId);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL, UserRole.CLIENT)
  findOne(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.svc.findOne(id, tenantId);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.svc.create(tenantId, userId, dto);
  }

  @Patch(':id/send')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
  @ApiOperation({ summary: 'Envoyer la facture au client' })
  send(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.svc.send(id, tenantId);
  }

  @Patch(':id/pay')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  @ApiOperation({ summary: 'Marquer comme payée' })
  markPaid(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body('paymentRef') paymentRef?: string,
  ) {
    return this.svc.markPaid(id, tenantId, paymentRef);
  }
}
