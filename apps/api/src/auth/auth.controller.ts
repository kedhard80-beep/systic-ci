import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  TwoFAVerifyDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/auth.dto';
import { Request } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion — retourne access + refresh token' })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(
      dto,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Inscription client public' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rafraîchir le token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('2fa/verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vérifier code 2FA après login' })
  verify2FA(@Body() dto: TwoFAVerifyDto & { userId: string }) {
    return this.authService.verify2FA(dto.userId, dto);
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Demander réinitialisation mot de passe' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Réinitialiser mot de passe avec token email' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  changePassword(@CurrentUser('id') userId: string, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(userId, dto);
  }

  @Get('2fa/setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialiser 2FA — retourne QR code + secret' })
  setup2FA(@CurrentUser('id') userId: string) {
    return this.authService.setup2FA(userId);
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activer 2FA après validation du code' })
  enable2FA(@CurrentUser('id') userId: string, @Body() dto: TwoFAVerifyDto) {
    return this.authService.enable2FA(userId, dto);
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Désactiver 2FA' })
  disable2FA(@CurrentUser('id') userId: string, @Body() dto: TwoFAVerifyDto) {
    return this.authService.disable2FA(userId, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profil utilisateur courant' })
  me(@CurrentUser() user: any) {
    return user;
  }
}
