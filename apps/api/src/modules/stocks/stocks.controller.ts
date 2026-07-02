import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { StocksService, AdjustStockDto, TransferStockDto } from './stocks.service';

@ApiTags('Stocks & Inventaire')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
@Controller('stocks')
export class StocksController {
  constructor(private readonly stocks: StocksService) {}

  @Get()
  @ApiOperation({ summary: 'Voir le stock (filtrable par produit/entrepôt)' })
  getStock(
    @CurrentUser('tenantId') tenantId: string,
    @Query('productId') productId?: string,
    @Query('warehouse') warehouse?: string,
  ) {
    return this.stocks.getStock(tenantId, { productId, warehouse });
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Alertes stock faible' })
  getLowStockAlerts(@CurrentUser('tenantId') tenantId: string) {
    return this.stocks.getLowStockAlerts(tenantId);
  }

  @Get('value')
  @ApiOperation({ summary: 'Valeur totale du stock (coût & prix de vente)' })
  getStockValue(@CurrentUser('tenantId') tenantId: string) {
    return this.stocks.getStockValue(tenantId);
  }

  @Get('warehouses')
  @ApiOperation({ summary: 'Liste des entrepôts' })
  getWarehouses(@CurrentUser('tenantId') tenantId: string) {
    return this.stocks.getWarehouses(tenantId);
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Ajustement de stock (entrée / sortie manuelle)' })
  adjust(@CurrentUser('tenantId') tenantId: string, @Body() dto: AdjustStockDto) {
    return this.stocks.adjust(tenantId, dto);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfert entre entrepôts' })
  transfer(@CurrentUser('tenantId') tenantId: string, @Body() dto: TransferStockDto) {
    return this.stocks.transfer(tenantId, dto);
  }
}
