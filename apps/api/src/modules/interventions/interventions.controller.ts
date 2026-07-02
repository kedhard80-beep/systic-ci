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
import { InterventionsService } from './interventions.service';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { UserRole, InterventionStatus } from '@prisma/client';

@ApiTags('Interventions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('interventions')
export class InterventionsController {
  constructor(private readonly svc: InterventionsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL, UserRole.TECHNICIEN)
  @ApiOperation({ summary: 'Liste des interventions' })
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: InterventionStatus,
    @Query('technicienId') technicienId?: string,
    @Query('clientId') clientId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.svc.findAll(tenantId, {
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
      status,
      technicienId,
      clientId,
      from,
      to,
    });
  }

  @Get('calendar')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.TECHNICIEN, UserRole.COMMERCIAL)
  @ApiOperation({ summary: 'Calendrier des interventions' })
  getCalendar(
    @CurrentUser('tenantId') tenantId: string,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.svc.getCalendar(tenantId, +year || new Date().getFullYear(), +month || new Date().getMonth() + 1);
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
  @ApiOperation({ summary: 'Statistiques interventions' })
  getStats(@CurrentUser('tenantId') tenantId: string) {
    return this.svc.getStats(tenantId);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL, UserRole.TECHNICIEN)
  @ApiOperation({ summary: 'Détail intervention' })
  findOne(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.svc.findOne(id, tenantId);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
  @ApiOperation({ summary: 'Créer une intervention' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateInterventionDto,
  ) {
    return this.svc.create(tenantId, userId, dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.TECHNICIEN, UserRole.COMMERCIAL)
  @ApiOperation({ summary: 'Mettre à jour le statut' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body('status') status: InterventionStatus,
    @Body('metadata') metadata?: Record<string, unknown>,
  ) {
    return this.svc.updateStatus(id, tenantId, status, metadata);
  }

  @Post(':id/assign')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
  @ApiOperation({ summary: 'Assigner un technicien' })
  assignTechnicien(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body('technicienId') technicienId: string,
  ) {
    return this.svc.assignTechnicien(id, tenantId, technicienId);
  }
}
