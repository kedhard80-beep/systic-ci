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
import { ContractsService, CreateContractDto } from './contracts.service';
import { UserRole, ContractStatus } from '@prisma/client';

@ApiTags('Contrats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('contracts')
export class ContractsController {
  constructor(private readonly svc: ContractsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL, UserRole.CLIENT)
  @ApiOperation({ summary: 'Liste des contrats' })
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: ContractStatus,
    @Query('clientId') clientId?: string,
  ) {
    return this.svc.findAll(tenantId, { page: page ? +page : 1, limit: limit ? +limit : 20, status, clientId });
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  getStats(@CurrentUser('tenantId') tenantId: string) {
    return this.svc.getStats(tenantId);
  }

  @Get('expiring')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
  @ApiOperation({ summary: 'Contrats qui expirent bientôt' })
  getExpiring(
    @CurrentUser('tenantId') tenantId: string,
    @Query('days') days?: number,
  ) {
    return this.svc.getExpiringContracts(tenantId, days ? +days : 30);
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
    @Body() dto: CreateContractDto,
  ) {
    return this.svc.create(tenantId, userId, dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body('status') status: ContractStatus,
  ) {
    return this.svc.updateStatus(id, tenantId, status);
  }
}
