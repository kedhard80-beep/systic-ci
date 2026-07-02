import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async findAll(
    tenantId: string,
    params: { page?: number; limit?: number; folder?: string; mimeType?: string; projectId?: string },
  ) {
    const { page = 1, limit = 50, folder, mimeType, projectId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.MediaWhereInput = {
      tenantId,
      ...(folder && { folder }),
      ...(mimeType && { mimeType: { startsWith: mimeType } }),
      ...(projectId && { projectId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.media.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const media = await this.prisma.media.findFirst({ where: { id, tenantId } });
    if (!media) throw new NotFoundException(`Média ${id} introuvable`);
    return media;
  }

  async upload(
    tenantId: string,
    userId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    options: { folder?: string; alt?: string; caption?: string; projectId?: string },
  ) {
    const { key, url } = await this.storage.upload(file.buffer, {
      originalName: file.originalname,
      mimeType: file.mimetype,
      folder: `${tenantId}/${options.folder ?? 'uploads'}`,
      tenantId,
      isPublic: true,
    });

    return this.prisma.media.create({
      data: {
        tenantId,
        name: file.originalname,
        url,
        mimeType: file.mimetype,
        size: file.size,
        alt: options.alt,
        caption: options.caption,
        folder: options.folder ?? 'uploads',
        projectId: options.projectId,
        createdBy: userId,
      },
    });
  }

  async update(
    id: string,
    tenantId: string,
    dto: { alt?: string; caption?: string; folder?: string },
  ) {
    await this.findOne(id, tenantId);
    return this.prisma.media.update({ where: { id }, data: dto });
  }

  async delete(id: string, tenantId: string) {
    const media = await this.findOne(id, tenantId);
    // Extract S3 key from URL and delete from storage
    try {
      const url = new URL(media.url);
      const key = url.pathname.slice(1); // remove leading /
      await this.storage.delete(key);
    } catch {
      // ignore storage errors — still delete DB record
    }
    return this.prisma.media.delete({ where: { id } });
  }

  async getFolders(tenantId: string) {
    const media = await this.prisma.media.findMany({
      where: { tenantId },
      select: { folder: true },
      distinct: ['folder'],
      orderBy: { folder: 'asc' },
    });
    return media.map((m) => m.folder);
  }

  async getStats(tenantId: string) {
    const [total, totalSize, byType] = await Promise.all([
      this.prisma.media.count({ where: { tenantId } }),
      this.prisma.media.aggregate({ where: { tenantId }, _sum: { size: true } }),
      this.prisma.media.groupBy({
        by: ['mimeType'],
        where: { tenantId },
        _count: true,
        _sum: { size: true },
      }),
    ]);

    return {
      total,
      totalSize: totalSize._sum.size ?? 0,
      totalSizeMB: Math.round(((totalSize._sum.size ?? 0) / 1024 / 1024) * 100) / 100,
      byType,
    };
  }
}
