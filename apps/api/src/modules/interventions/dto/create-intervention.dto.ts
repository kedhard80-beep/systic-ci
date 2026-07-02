import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum InterventionType {
  INSTALLATION = 'INSTALLATION',
  MAINTENANCE = 'MAINTENANCE',
  DEPANNAGE = 'DEPANNAGE',
  AUDIT = 'AUDIT',
  FORMATION = 'FORMATION',
}

export enum InterventionPriority {
  BASSE = 'BASSE',
  NORMALE = 'NORMALE',
  HAUTE = 'HAUTE',
  URGENTE = 'URGENTE',
}

export class CreateInterventionDto {
  @ApiProperty()
  @IsString()
  clientId: string;

  @ApiProperty({ enum: InterventionType })
  @IsEnum(InterventionType)
  type: InterventionType;

  @ApiProperty({ example: '2024-12-15T09:00:00Z' })
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional({ example: 180, description: 'Durée estimée en minutes' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  estimatedDuration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Riviera 2, Abidjan' })
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiPropertyOptional({ enum: InterventionPriority, default: InterventionPriority.NORMALE })
  @IsOptional()
  @IsEnum(InterventionPriority)
  priority?: InterventionPriority;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technicienIds?: string[];
}
