import {
  Controller,
  Get,
  Post,
  Patch,
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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsersService, CreateUserDto, UpdateUserDto } from './users.service';
import { UserRole } from '@prisma/client';

@ApiTags('Utilisateurs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  @ApiOperation({ summary: 'Liste des utilisateurs' })
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: UserRole,
    @Query('search') search?: string,
  ) {
    return this.svc.findAll(tenantId, { page: page ? +page : 1, limit: limit ? +limit : 20, role, search });
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  @ApiOperation({ summary: 'Statistiques utilisateurs' })
  getStats(@CurrentUser('tenantId') tenantId: string) {
    return this.svc.getStats(tenantId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Mon profil' })
  getMe(
    @CurrentUser('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.svc.findOne(id, tenantId);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  @ApiOperation({ summary: 'Détail utilisateur' })
  findOne(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.svc.findOne(id, tenantId);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  @ApiOperation({ summary: 'Créer un utilisateur' })
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateUserDto) {
    return this.svc.create(tenantId, dto);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Mettre à jour mon profil' })
  updateMe(
    @CurrentUser('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: UpdateUserDto,
  ) {
    // Restrict self-update: can't change own role
    const { role: _, ...safeDto } = dto;
    return this.svc.update(id, tenantId, safeDto);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  update(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.svc.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Désactiver un utilisateur' })
  deactivate(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.svc.deactivate(id, tenantId, currentUserId);
  }
}
