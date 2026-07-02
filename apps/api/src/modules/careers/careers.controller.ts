import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CareersService, CreateJobDto, CreateApplicationDto } from './careers.service';
import { UserRole } from '@prisma/client';

@ApiTags('Carrières')
@Controller('careers')
export class CareersController {
  constructor(private readonly svc: CareersService) {}

  @Get('jobs')
  @Public()
  @ApiOperation({ summary: 'Liste des offres publiées' })
  listJobs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('departement') departement?: string,
  ) {
    return this.svc.listJobs('default', {
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
      published: true,
      departement,
    });
  }

  @Get('jobs/:id')
  @Public()
  findJob(@Param('id') id: string) {
    return this.svc.findJob(id, 'default');
  }

  @Post('apply')
  @Public()
  @ApiOperation({ summary: 'Postuler à une offre' })
  apply(@Body() dto: CreateApplicationDto) {
    return this.svc.apply('default', dto);
  }

  // --- Admin endpoints ---

  @Get('admin/jobs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  @ApiOperation({ summary: 'Toutes les offres (admin)' })
  listAllJobs(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.svc.listJobs(tenantId, { page: page ? +page : 1, limit: limit ? +limit : 20 });
  }

  @Post('admin/jobs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  createJob(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateJobDto,
  ) {
    return this.svc.createJob(tenantId, userId, dto);
  }

  @Put('admin/jobs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  updateJob(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: Partial<CreateJobDto>,
  ) {
    return this.svc.updateJob(id, tenantId, dto);
  }

  @Delete('admin/jobs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  deleteJob(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.svc.deleteJob(id, tenantId);
  }

  @Get('admin/jobs/:jobId/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  listApplications(
    @Param('jobId') jobId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.svc.listApplications(tenantId, jobId, { page: page ? +page : 1, limit: limit ? +limit : 20 });
  }
}
