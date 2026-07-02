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
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UserRole, QuoteStatus } from '@prisma/client';

@ApiTags('Devis')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('quotes')
export class QuotesController {
  constructor(private readonly svc: QuotesService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
  @ApiOperation({ summary: 'Liste des devis' })
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: QuoteStatus,
    @Query('clientId') clientId?: string,
  ) {
    return this.svc.findAll(tenantId, { page: page ? +page : 1, limit: limit ? +limit : 20, status, clientId });
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
  @ApiOperation({ summary: 'Statistiques devis' })
  getStats(@CurrentUser('tenantId') tenantId: string) {
    return this.svc.getStats(tenantId);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
  @ApiOperation({ summary: 'Détail devis' })
  findOne(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.svc.findOne(id, tenantId);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
  @ApiOperation({ summary: 'Créer un devis' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateQuoteDto,
  ) {
    return this.svc.create(tenantId, userId, dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
  @ApiOperation({ summary: 'Changer statut devis (machine à états)' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body('status') status: QuoteStatus,
  ) {
    return this.svc.updateStatus(id, tenantId, status, userId);
  }

  @Post(':id/convert')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
  @ApiOperation({ summary: 'Convertir devis accepté en contrat' })
  convertToContract(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.svc.convertToContract(id, tenantId, userId);
  }
}
