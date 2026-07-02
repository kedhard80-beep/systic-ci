import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { IsString, IsNumber, IsOptional, IsBoolean, Min, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() category: string;
  @ApiProperty() @IsNumber() @Min(0) price: number;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() brand?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() unit?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) cost?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() vatRate?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() minStock?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}
export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private generateReference(): string {
    return `PRD-${Date.now().toString(36).toUpperCase()}`;
  }

  async findAll(
    tenantId: string,
    params: { page?: number; limit?: number; category?: string; search?: string; isActive?: boolean },
  ) {
    const { page = 1, limit = 50, category, search, isActive } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      tenantId,
      ...(category && { category }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { reference: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          stocks: { select: { warehouse: true, quantity: true, available: true } },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: {
        stocks: true,
        _count: { select: { quoteItems: true } },
      },
    });
    if (!product) throw new NotFoundException(`Produit ${id} introuvable`);
    return product;
  }

  async create(tenantId: string, dto: CreateProductDto) {
    const existing = await this.prisma.product.findFirst({
      where: { tenantId, name: { equals: dto.name, mode: 'insensitive' } },
    });
    if (existing) throw new ConflictException('Un produit avec ce nom existe déjà');

    return this.prisma.product.create({
      data: {
        tenantId,
        reference: this.generateReference(),
        name: dto.name,
        description: dto.description,
        category: dto.category,
        brand: dto.brand,
        unit: dto.unit ?? 'U',
        price: dto.price,
        cost: dto.cost,
        vatRate: dto.vatRate ?? 0.18,
        minStock: dto.minStock ?? 0,
        tags: dto.tags ?? [],
        isActive: true,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateProductDto) {
    await this.findOne(id, tenantId);
    const { name, ...rest } = dto;
    return this.prisma.product.update({
      where: { id },
      data: { ...(name && { name }), ...rest },
    });
  }

  async delete(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.product.update({ where: { id }, data: { isActive: false } });
  }

  async getCategories(tenantId: string) {
    const products = await this.prisma.product.findMany({
      where: { tenantId, isActive: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return products.map((p) => p.category);
  }

  async getLowStock(tenantId: string) {
    return this.prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
        stocks: {
          some: {
            available: { lte: this.prisma.product.fields.minStock as any },
          },
        },
      },
      include: { stocks: true },
    });
  }
}
