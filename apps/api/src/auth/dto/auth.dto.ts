import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsBoolean,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class LoginDto {
  @ApiProperty({ example: 'admin@systic.ci' })
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;

  @ApiProperty({ example: 'MotDePasse123!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ description: 'Rester connecté (refresh token longue durée)' })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

export class RegisterDto {
  @ApiProperty() @IsString() @MinLength(2) firstName: string;
  @ApiProperty() @IsString() @MinLength(2) lastName: string;
  @ApiProperty() @IsEmail() @Transform(({ value }) => value?.toLowerCase()) email: string;
  @ApiProperty() @IsString() @MinLength(8) password: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() company?: string;
}

export class TwoFAVerifyDto {
  @ApiProperty({ description: 'Code TOTP 6 chiffres' })
  @IsString()
  @Length(6, 6)
  code: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token reçu par email' })
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}
