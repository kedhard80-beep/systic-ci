import {
  Controller,
  Post,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  Query,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StorageService } from './storage.service';
import { UserRole } from '@prisma/client';

@ApiTags('Storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('storage')
export class StorageController {
  constructor(private readonly svc: StorageService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } })) // 10MB
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('tenantId') tenantId: string,
    @Query('folder') folder?: string,
    @Query('public') isPublic?: string,
  ) {
    if (!file) throw new BadRequestException('Aucun fichier fourni');

    return this.svc.upload(file.buffer, {
      originalName: file.originalname,
      mimeType: file.mimetype,
      folder: folder ?? 'uploads',
      tenantId,
      isPublic: isPublic === 'true',
    });
  }

  @Get('presigned/:key')
  @ApiOperation({ summary: 'Get presigned URL for private file' })
  getPresignedUrl(
    @Param('key') key: string,
    @Query('expires') expires?: number,
  ) {
    return this.svc.getPresignedUrl(key, expires ? +expires : 3600).then((url) => ({ url }));
  }

  @Delete(':key')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DIRECTION)
  @ApiOperation({ summary: 'Delete a file (admin only)' })
  delete(@Param('key') key: string) {
    return this.svc.delete(key).then(() => ({ success: true }));
  }
}
