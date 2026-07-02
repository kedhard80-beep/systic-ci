import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { IsString, IsOptional, IsBoolean, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreatePortfolioItemDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() category: string;
  @ApiProperty() @IsDateString() date: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() client?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() location?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() featured?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) before?: string[];
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) after?: string[];
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}
export class UpdatePortfolioItemDto extends PartialType(CreatePortfolioItemDto) {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPublished?: boolean;
}

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    params: {
      page?: number;
      limit?: number;
      category?: string;
      featured?: boolean;
      published?: boolean;
    },
  ) {
    const { page = 1, limit = 20, category, featured, published } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.PortfolioItemWhereInput = {
      tenantId,
      ...(category && { category }),
      ...(featured !== undefined && { featured }),
      ...(published !== undefined && { isPublished: published }),
    };

    const [data, total] = await Promise.all([
      this.prisma.portfolioItem.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: [{ featured: 'desc' }, { date: 'desc' }],
      }),
      this.prisma.portfolioItem.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const item = await this.prisma.portfolioItem.findFirst({ where: { id, tenantId } });
    if (!item) throw new NotFoundException(`Réalisation ${id} introuvable`);
    await this.prisma.portfolioItem.update({ where: { id }, data: { views: { increment: 1 } } });
    return item;
  }

  async create(tenantId: string, dto: CreatePortfolioItemDto) {
    return this.prisma.portfolioItem.create({
      data: {
        tenantId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        client: dto.client,
        location: dto.location,
        date: new Date(dto.date),
        featured: dto.featured ?? false,
        before: dto.before ?? [],
        after: dto.after ?? [],
        tags: dto.tags ?? [],
        isPublished: true,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdatePortfolioItemDto) {
    await this.findOne(id, tenantId);
    const { date, ...rest } = dto;
    return this.prisma.portfolioItem.update({
      where: { id },
      data: { ...rest, ...(date && { date: new Date(date) }) },
    });
  }

  async delete(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.portfolioItem.delete({ where: { id } });
  }

  async getCategories(tenantId: string) {
    const items = await this.prisma.portfolioItem.findMany({
      where: { tenantId, isPublished: true },
      select: { category: true },
      distinct: ['category'],
    });
    return items.map((i) => i.category);
  }

  async getFeatured(tenantId: string, limit = 6) {
    return this.prisma.portfolioItem.findMany({
      where: { tenantId, isPublished: true, featured: true },
      orderBy: { date: 'desc' },
      take: Number(limit),
    });
  }
}
