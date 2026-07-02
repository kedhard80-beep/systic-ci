import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserRole, ProjectStatus } from '@prisma/client';
import { ProjectsService, CreateProjectDto, UpdateProjectDto } from './projects.service';

@ApiTags('Projets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: ProjectStatus,
    @Query('clientId') clientId?: string,
  ) {
    return this.projects.findAll(tenantId, {
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
      status,
      clientId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.projects.findOne(id, tenantId);
  }

  @Post()
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateProjectDto) {
    return this.projects.create(tenantId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projects.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  delete(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.projects.delete(id, tenantId);
  }

  @Post(':id/techniciens')
  @ApiOperation({ summary: 'Assigner un technicien au projet' })
  assignTechnicien(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body('technicienId') technicienId: string,
    @Body('role') role?: string,
  ) {
    return this.projects.assignTechnicien(id, tenantId, technicienId, role);
  }
}
