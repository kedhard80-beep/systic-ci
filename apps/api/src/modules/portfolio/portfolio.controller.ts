import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { PortfolioService, CreatePortfolioItemDto, UpdatePortfolioItemDto } from './portfolio.service';

@ApiTags('Portfolio — Réalisations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolio: PortfolioService) {}

  // Public endpoints (accessible même sans auth via le site corporate)
  @Get()
  @Roles(
    UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL,
    UserRole.CLIENT, UserRole.VISITEUR,
  )
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('featured') featured?: string,
  ) {
    return this.portfolio.findAll(tenantId, {
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
      category,
      featured: featured !== undefined ? featured === 'true' : undefined,
      published: true,
    });
  }

  @Get('featured')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL, UserRole.CLIENT, UserRole.VISITEUR)
  @ApiOperation({ summary: 'Réalisations en vedette (page accueil)' })
  getFeatured(
    @CurrentUser('tenantId') tenantId: string,
    @Query('limit') limit?: string,
  ) {
    return this.portfolio.getFeatured(tenantId, limit ? +limit : 6);
  }

  @Get('categories')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL, UserRole.CLIENT, UserRole.VISITEUR)
  getCategories(@CurrentUser('tenantId') tenantId: string) {
    return this.portfolio.getCategories(tenantId);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL, UserRole.CLIENT, UserRole.VISITEUR)
  findOne(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.portfolio.findOne(id, tenantId);
  }

  // Admin-only mutations
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreatePortfolioItemDto) {
    return this.portfolio.create(tenantId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  update(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: UpdatePortfolioItemDto,
  ) {
    return this.portfolio.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  delete(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.portfolio.delete(id, tenantId);
  }
}
