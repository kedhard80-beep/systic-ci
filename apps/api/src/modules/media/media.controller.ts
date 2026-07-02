import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
  UseInterceptors, UploadedFile, ParseFilePipe,
  MaxFileSizeValidator, FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { MediaService } from './media.service';

const ADMIN_ROLES = [UserRole.SUPER_ADMIN, UserRole.DIRECTION];

@ApiTags('Médiathèque')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...ADMIN_ROLES)
@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les médias' })
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('folder') folder?: string,
    @Query('mimeType') mimeType?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.media.findAll(tenantId, {
      page: page ? +page : 1,
      limit: limit ? +limit : 50,
      folder,
      mimeType,
      projectId,
    });
  }

  @Get('folders')
  @ApiOperation({ summary: 'Liste des dossiers' })
  getFolders(@CurrentUser('tenantId') tenantId: string) {
    return this.media.getFolders(tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques médiathèque' })
  getStats(@CurrentUser('tenantId') tenantId: string) {
    return this.media.getStats(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.media.findOne(id, tenantId);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Uploader un fichier (image, PDF, document)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string' },
        alt: { type: 'string' },
        caption: { type: 'string' },
        projectId: { type: 'string' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }), // 20MB
          new FileTypeValidator({
            fileType: /^(image\/(jpeg|jpg|png|webp|gif|svg\+xml)|application\/pdf|video\/(mp4|webm))$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('folder') folder?: string,
    @Body('alt') alt?: string,
    @Body('caption') caption?: string,
    @Body('projectId') projectId?: string,
  ) {
    return this.media.upload(tenantId, userId, file, { folder, alt, caption, projectId });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: { alt?: string; caption?: string; folder?: string },
  ) {
    return this.media.update(id, tenantId, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.media.delete(id, tenantId);
  }
}
