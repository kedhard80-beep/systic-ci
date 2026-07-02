import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des clients avec pagination et recherche' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'secteur', required: false })
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.DIRECTION,
    UserRole.COMMERCIAL,
  )
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('secteur') secteur?: string,
  ) {
    return this.clientsService.findAll(tenantId, { page, limit, search, secteur });
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
  getStats(@CurrentUser('tenantId') tenantId: string) {
    return this.clientsService.getStats(tenantId);
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.DIRECTION,
    UserRole.COMMERCIAL,
    UserRole.TECHNICIEN,
  )
  findOne(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.clientsService.findOne(id, tenantId);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateClientDto,
  ) {
    return this.clientsService.create(tenantId, userId, dto);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
  update(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, tenantId, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  remove(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.clientsService.remove(id, tenantId);
  }

  @Post(':id/activities')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL, UserRole.TECHNICIEN)
  addActivity(
    @Param('id') clientId: string,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { type: string; description: string; metadata?: Record<string, unknown> },
  ) {
    return this.clientsService.addActivity(
      clientId, tenantId, userId,
      body.type, body.description, body.metadata,
    );
  }
}
