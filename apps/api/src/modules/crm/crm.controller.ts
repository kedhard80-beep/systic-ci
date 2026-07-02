import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserRole, LeadStage, LeadSource } from '@prisma/client';
import { CrmService } from './crm.service';
import { CreateLeadDto, UpdateLeadDto, MoveLeadDto, CreatePublicDevisDto } from './dto/lead.dto';

@ApiTags('CRM — Pipeline')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
@Controller('crm')
export class CrmController {
  constructor(private readonly crm: CrmService) {}

  // ── Leads ─────────────────────────────────────────────────

  @Get('leads')
  @ApiOperation({ summary: 'Lister tous les leads (paginé + filtres)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'stage', required: false, enum: LeadStage })
  @ApiQuery({ name: 'source', required: false, enum: LeadSource })
  @ApiQuery({ name: 'assignedTo', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('stage') stage?: LeadStage,
    @Query('source') source?: LeadSource,
    @Query('assignedTo') assignedTo?: string,
    @Query('search') search?: string,
  ) {
    return this.crm.findAll(tenantId, {
      page: page ? +page : 1,
      limit: limit ? +limit : 50,
      stage,
      source,
      assignedTo,
      search,
    });
  }

  @Get('pipeline')
  @ApiOperation({ summary: 'Vue Kanban du pipeline (leads actifs par stage)' })
  getPipeline(@CurrentUser('tenantId') tenantId: string) {
    return this.crm.getPipeline(tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques CRM (taux de conversion, pipeline €, etc.)' })
  getStats(@CurrentUser('tenantId') tenantId: string) {
    return this.crm.getStats(tenantId);
  }

  @Get('leads/:id')
  @ApiOperation({ summary: "Détail d'un lead" })
  findOne(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.crm.findOne(id, tenantId);
  }

  @Post('leads')
  @ApiOperation({ summary: 'Créer un lead' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateLeadDto,
  ) {
    return this.crm.create(tenantId, dto);
  }

  /**
   * Endpoint public : formulaire de devis du site web.
   * Pas d'authentification requise — crée un lead WEBSITE.
   */
  @Post('public-devis')
  @Public()
  @ApiOperation({ summary: 'Soumettre un devis depuis le site web (sans auth)' })
  createPublicDevis(@Body() dto: CreatePublicDevisDto) {
    return this.crm.createPublicLead(dto);
  }

  @Patch('leads/:id')
  @ApiOperation({ summary: 'Modifier un lead' })
  update(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.crm.update(id, tenantId, dto);
  }

  @Patch('leads/:id/stage')
  @ApiOperation({ summary: 'Déplacer un lead vers un nouveau stage (drag & drop)' })
  moveStage(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: MoveLeadDto,
  ) {
    return this.crm.moveStage(id, tenantId, dto.stage);
  }

  @Delete('leads/:id')
  @ApiOperation({ summary: 'Supprimer un lead' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  delete(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.crm.delete(id, tenantId);
  }
}
