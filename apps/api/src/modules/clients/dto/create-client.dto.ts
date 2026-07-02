import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ClientType } from '@prisma/client';

export { ClientType };

export class CreateClientDto {
  @ApiProperty({ example: 'Banque Atlantique CI' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  nom: string;

  @ApiPropertyOptional({ example: 'Banque Atlantique CI SARL' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  entreprise?: string;

  @ApiPropertyOptional({ enum: ClientType, default: ClientType.ENTREPRISE })
  @IsOptional()
  @IsEnum(ClientType)
  type?: ClientType;

  @ApiPropertyOptional({ example: 'contact@banqueatlantique.ci' })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email?: string;

  @ApiPropertyOptional({ example: '+225 20 30 40 50' })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional({ example: 'Plateau, Abidjan' })
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiPropertyOptional({ example: 'Finance' })
  @IsOptional()
  @IsString()
  secteur?: string;

  @ApiPropertyOptional({ example: 'Client VIP — contrat annuel' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ example: 'CI-ABJ-0001' })
  @IsOptional()
  @IsString()
  siret?: string;
}
