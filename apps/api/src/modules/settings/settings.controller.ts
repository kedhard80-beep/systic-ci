import { Controller, Get, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SettingsService } from './settings.service';
import { UserRole } from '@prisma/client';

@ApiTags('Paramètres')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
@Controller('settings')
export class SettingsController {
  constructor(private readonly svc: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Tous les paramètres' })
  getAll(@CurrentUser('tenantId') tenantId: string) {
    return this.svc.getAll(tenantId);
  }

  @Get(':key')
  get(@Param('key') key: string, @CurrentUser('tenantId') tenantId: string) {
    return this.svc.get(tenantId, key).then((value) => ({ key, value }));
  }

  @Put()
  @ApiOperation({ summary: 'Mettre à jour plusieurs paramètres' })
  setBulk(@CurrentUser('tenantId') tenantId: string, @Body() body: Record<string, unknown>) {
    return this.svc.setBulk(tenantId, body).then(() => ({ success: true }));
  }

  @Put(':key')
  set(
    @Param('key') key: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body('value') value: unknown,
  ) {
    return this.svc.set(tenantId, key, value).then(() => ({ success: true }));
  }

  @Delete(':key')
  delete(@Param('key') key: string, @CurrentUser('tenantId') tenantId: string) {
    return this.svc.delete(tenantId, key).then(() => ({ success: true }));
  }
}
