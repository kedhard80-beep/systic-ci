import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { ProductsService, CreateProductDto, UpdateProductDto } from './products.service';

@ApiTags('Produits & Catalogue')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL, UserRole.TECHNICIEN)
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.products.findAll(tenantId, {
      page: page ? +page : 1,
      limit: limit ? +limit : 50,
      category,
      search,
      isActive: true,
    });
  }

  @Get('categories')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL, UserRole.TECHNICIEN)
  @ApiOperation({ summary: 'Liste des catégories produits' })
  getCategories(@CurrentUser('tenantId') tenantId: string) {
    return this.products.getCategories(tenantId);
  }

  @Get('low-stock')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  @ApiOperation({ summary: 'Produits en stock faible' })
  getLowStock(@CurrentUser('tenantId') tenantId: string) {
    return this.products.getLowStock(tenantId);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL, UserRole.TECHNICIEN)
  findOne(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.products.findOne(id, tenantId);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateProductDto) {
    return this.products.create(tenantId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  update(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.products.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  @ApiOperation({ summary: 'Désactiver un produit (soft delete)' })
  delete(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.products.delete(id, tenantId);
  }
}
