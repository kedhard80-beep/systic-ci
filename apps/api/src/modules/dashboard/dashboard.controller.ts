import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';
import { UserRole } from '@prisma/client';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly svc: DashboardService) {}

  @Get('admin')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  @ApiOperation({ summary: "Dashboard super admin — KPIs, CA, activités récentes" })
  getAdminDashboard() {
    return this.svc.getSuperAdminDashboard();
  }

  @Get('client')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Dashboard client — contrats, factures, tickets' })
  getClientDashboard(@CurrentUser('clientId') clientId: string) {
    return this.svc.getClientDashboard(clientId);
  }

  @Get('technicien')
  @Roles(UserRole.TECHNICIEN)
  @ApiOperation({ summary: "Dashboard technicien — missions du jour, planning" })
  getTechnicienDashboard(@CurrentUser('technicienId') technicienId: string) {
    return this.svc.getTechnicienDashboard(technicienId);
  }
}
