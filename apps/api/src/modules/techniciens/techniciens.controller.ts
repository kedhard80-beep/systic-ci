import {
  Controller, Get, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { TechniciensService, UpdateTechnicienDto } from './techniciens.service';

@ApiTags('Techniciens')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('techniciens')
export class TechniciensController {
  constructor(private readonly techniciens: TechniciensService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
  @ApiQuery({ name: 'available', required: false })
  @ApiQuery({ name: 'zone', required: false })
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('available') available?: string,
    @Query('zone') zone?: string,
  ) {
    return this.techniciens.findAll(tenantId, {
      page: page ? +page : 1,
      limit: limit ? +limit : 50,
      available: available !== undefined ? available === 'true' : undefined,
      zone,
    });
  }

  @Get('me')
  @Roles(UserRole.TECHNICIEN)
  @ApiOperation({ summary: 'Profil du technicien connecté' })
  getMyProfile(@CurrentUser('id') userId: string) {
    return this.techniciens.findByUserId(userId);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  findOne(@Param('id') id: string) {
    return this.techniciens.findOne(id);
  }

  @Get(':id/planning')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.TECHNICIEN)
  @ApiOperation({ summary: "Planning mensuel d'un technicien" })
  getPlanning(
    @Param('id') id: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const now = new Date();
    return this.techniciens.getPlanning(
      id,
      year ? +year : now.getFullYear(),
      month ? +month : now.getMonth() + 1,
    );
  }

  @Get(':id/stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.TECHNICIEN)
  getStats(@Param('id') id: string) {
    return this.techniciens.getStats(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.TECHNICIEN)
  update(@Param('id') id: string, @Body() dto: UpdateTechnicienDto) {
    return this.techniciens.update(id, dto);
  }

  @Patch(':id/availability')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.TECHNICIEN)
  @ApiOperation({ summary: 'Modifier la disponibilité' })
  setAvailability(
    @Param('id') id: string,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    return this.techniciens.setAvailability(id, isAvailable);
  }
}
