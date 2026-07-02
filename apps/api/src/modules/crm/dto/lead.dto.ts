import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { LeadStage, LeadSource } from '@prisma/client';

export class CreateLeadDto {
  @ApiProperty({ example: 'Kouamé Jean-Baptiste' })
  @IsString()
  @MinLength(2)
  nom: string;

  @ApiPropertyOptional({ example: 'Groupe Bolloré CI' })
  @IsOptional()
  @IsString()
  entreprise?: string;

  @ApiPropertyOptional({ example: 'jb.kouame@bollore.ci' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+225 07 07 07 07 07' })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional({ example: 5000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  montant?: number;

  @ApiPropertyOptional({ enum: LeadStage, default: LeadStage.PROSPECT })
  @IsOptional()
  @IsEnum(LeadStage)
  stage?: LeadStage;

  @ApiPropertyOptional({ enum: LeadSource })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiPropertyOptional({ description: 'ID du commercial assigné' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateLeadDto extends PartialType(CreateLeadDto) {}

export class MoveLeadDto {
  @ApiProperty({ enum: LeadStage })
  @IsEnum(LeadStage)
  stage: LeadStage;
}

// DTO spécifique au formulaire public (site web, sans authentification)
export class CreatePublicDevisDto {
  @ApiProperty({ example: 'Jean Kouassi' })
  @IsString()
  @MinLength(2)
  nom: string;

  @ApiProperty({ example: 'jean@entreprise.ci' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '07 00 00 00 00' })
  @IsString()
  @MinLength(8)
  telephone: string;

  @ApiPropertyOptional({ example: 'Société ABC' })
  @IsOptional()
  @IsString()
  entreprise?: string;

  @ApiProperty({ example: ['videosurveillance', 'controle-acces'] })
  @IsArray()
  @IsString({ each: true })
  services: string[];

  @ApiPropertyOptional({ example: '500 000 – 2 000 000 XOF' })
  @IsOptional()
  @IsString()
  budget?: string;

  @ApiPropertyOptional({ example: 'Court terme (1–4 semaines)' })
  @IsOptional()
  @IsString()
  delai?: string;

  @ApiProperty({ example: 'Installation vidéosurveillance pour 2 bâtiments...' })
  @IsString()
  @MinLength(20)
  description: string;
}
