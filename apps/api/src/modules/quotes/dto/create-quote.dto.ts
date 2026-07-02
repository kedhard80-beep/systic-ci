import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsPositive,
  ValidateNested,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuoteItemDto {
  @ApiProperty({ example: 'Caméra IP Hikvision 4MP — DS-2CD2143G2-I' })
  @IsString()
  description: string;

  @ApiProperty({ example: 6 })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ example: 85000 })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateQuoteDto {
  @ApiProperty({ example: 'clxyz123abc' })
  @IsString()
  clientId: string;

  @ApiProperty({ type: [QuoteItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteItemDto)
  items: QuoteItemDto[];

  @ApiPropertyOptional({ example: 0.18, description: 'Taux TVA (0.18 = 18%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  tvaRate?: number;

  @ApiPropertyOptional({ example: '2025-01-31' })
  @IsOptional()
  @IsDateString()
  validUntil?: Date;

  @ApiPropertyOptional({ example: 'Devis incluant main-d\'œuvre et déplacements' })
  @IsOptional()
  @IsString()
  notes?: string;
}
