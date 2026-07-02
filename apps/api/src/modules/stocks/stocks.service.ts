import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdjustStockDto {
  @ApiProperty() @IsString() productId: string;
  @ApiPropertyOptional({ default: 'PRINCIPAL' }) @IsOptional() @IsString() warehouse?: string;
  @ApiProperty({ description: 'Quantité à ajouter (positif) ou retirer (négatif)' })
  @IsNumber() quantity: number;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
}

export class TransferStockDto {
  @ApiProperty() @IsString() productId: string;
  @ApiProperty() @IsString() fromWarehouse: string;
  @ApiProperty() @IsString() toWarehouse: string;
  @ApiProperty() @IsNumber() @Min(1) quantity: number;
}

@Injectable()
export class StocksService {
  constructor(private readonly prisma: PrismaService) {}

  async getStock(tenantId: string, params: { productId?: string; warehouse?: string }) {
    const { productId, warehouse } = params;
    return this.prisma.stock.findMany({
      where: {
        tenantId,
        ...(productId && { productId }),
        ...(warehouse && { warehouse }),
      },
      include: {
        product: {
          select: { id: true, name: true, reference: true, category: true, unit: true, minStock: true },
        },
      },
      orderBy: [{ warehouse: 'asc' }, { product: { name: 'asc' } }],
    });
  }

  async getProductStock(productId: string, tenantId: string) {
    return this.prisma.stock.findMany({
      where: { productId, tenantId },
      include: { product: true },
    });
  }

  async adjust(tenantId: string, dto: AdjustStockDto) {
    const warehouse = dto.warehouse ?? 'PRINCIPAL';

    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, tenantId },
    });
    if (!product) throw new NotFoundException('Produit introuvable');

    const stock = await this.prisma.stock.findFirst({
      where: { tenantId, productId: dto.productId, warehouse },
    });

    if (!stock) {
      if (dto.quantity < 0) {
        throw new BadRequestException('Stock inexistant pour ce produit dans cet entrepôt');
      }
      return this.prisma.stock.create({
        data: {
          tenantId,
          productId: dto.productId,
          warehouse,
          quantity: dto.quantity,
          available: dto.quantity,
          reserved: 0,
        },
      });
    }

    const newQuantity = stock.quantity + dto.quantity;
    const newAvailable = stock.available + dto.quantity;

    if (newQuantity < 0) {
      throw new BadRequestException(
        `Stock insuffisant. Disponible : ${stock.available}, demandé : ${Math.abs(dto.quantity)}`,
      );
    }

    return this.prisma.stock.update({
      where: { id: stock.id },
      data: { quantity: newQuantity, available: Math.max(0, newAvailable) },
    });
  }

  async transfer(tenantId: string, dto: TransferStockDto) {
    const source = await this.prisma.stock.findFirst({
      where: { tenantId, productId: dto.productId, warehouse: dto.fromWarehouse },
    });

    if (!source || source.available < dto.quantity) {
      throw new BadRequestException(
        `Stock insuffisant dans l'entrepôt source. Disponible : ${source?.available ?? 0}`,
      );
    }

    const [from, to] = await this.prisma.$transaction([
      this.prisma.stock.update({
        where: { id: source.id },
        data: {
          quantity: source.quantity - dto.quantity,
          available: source.available - dto.quantity,
        },
      }),
      this.prisma.stock.upsert({
        where: {
          tenantId_productId_warehouse: {
            tenantId,
            productId: dto.productId,
            warehouse: dto.toWarehouse,
          },
        },
        update: {
          quantity: { increment: dto.quantity },
          available: { increment: dto.quantity },
        },
        create: {
          tenantId,
          productId: dto.productId,
          warehouse: dto.toWarehouse,
          quantity: dto.quantity,
          available: dto.quantity,
          reserved: 0,
        },
      }),
    ]);

    return { from, to };
  }

  async getLowStockAlerts(tenantId: string) {
    const stocks = await this.prisma.stock.findMany({
      where: { tenantId },
      include: { product: true },
    });

    return stocks.filter((s) => s.available <= s.product.minStock);
  }

  async getWarehouses(tenantId: string) {
    const stocks = await this.prisma.stock.findMany({
      where: { tenantId },
      select: { warehouse: true },
      distinct: ['warehouse'],
    });
    return stocks.map((s) => s.warehouse);
  }

  async getStockValue(tenantId: string) {
    const stocks = await this.prisma.stock.findMany({
      where: { tenantId },
      include: { product: { select: { cost: true, price: true } } },
    });

    const value = stocks.reduce(
      (acc, s) => {
        const cost = s.product.cost ?? 0;
        const price = s.product.price ?? 0;
        return {
          costValue: acc.costValue + s.quantity * cost,
          saleValue: acc.saleValue + s.quantity * price,
        };
      },
      { costValue: 0, saleValue: 0 },
    );

    return value;
  }
}
