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
import { BlogService, CreatePostDto } from './blog.service';
import { UserRole } from '@prisma/client';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly svc: BlogService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Liste des articles' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('published') published?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.svc.findAll('default', {
      page: page ? +page : 1,
      limit: limit ? +limit : 12,
      published: published !== undefined ? published !== 'false' : true,
      category,
      search,
    });
  }

  @Get('categories')
  @Public()
  getCategories() {
    return this.svc.getCategories('default');
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Lire un article par son slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.svc.findBySlug(slug, 'default');
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
  @ApiOperation({ summary: 'Créer un article (CMS)' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePostDto,
  ) {
    return this.svc.create(tenantId, userId, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION, UserRole.COMMERCIAL)
  @ApiOperation({ summary: 'Modifier un article' })
  update(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: Partial<CreatePostDto>,
  ) {
    return this.svc.update(id, tenantId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  @ApiOperation({ summary: 'Supprimer un article' })
  delete(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.svc.delete(id, tenantId);
  }
}
