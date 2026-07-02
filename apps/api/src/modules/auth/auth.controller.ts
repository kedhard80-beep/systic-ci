import {
  Controller, Post, Body, Get, Patch,
  UseGuards, Request, HttpCode, HttpStatus,
  Version,
} from "@nestjs/common";
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger";
import { IsEmail, IsString, MinLength, IsOptional } from "class-validator";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

// ===== DTOs =====
class LoginDto {
  @IsEmail({}, { message: "Email invalide" })
  email: string;

  @IsString()
  @MinLength(8, { message: "Mot de passe trop court" })
  password: string;
}

class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

class Verify2FADto {
  @IsString()
  userId: string;

  @IsString()
  token: string;
}

class Enable2FADto {
  @IsString()
  token: string;
}

class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

// ===== CONTROLLER =====
@ApiTags("Auth")
@Controller({ path: "auth", version: "1" })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Connexion utilisateur" })
  @ApiResponse({ status: 200, description: "Connexion réussie" })
  @ApiResponse({ status: 401, description: "Identifiants invalides" })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post("register")
  @ApiOperation({ summary: "Inscription (portail client)" })
  @ApiResponse({ status: 201, description: "Compte créé avec succès" })
  async register(@Body() dto: RegisterDto) {
    // Use default tenant for public registration
    const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID || "systic-ci";
    return this.authService.register({ ...dto, tenantId: DEFAULT_TENANT_ID });
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Rafraîchir les tokens JWT" })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Déconnexion" })
  async logout(@Request() req: { user: { id: string } }, @Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken, req.user.id);
  }

  @Post("2fa/verify")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Vérification code 2FA" })
  async verify2FA(@Body() dto: Verify2FADto) {
    return this.authService.verify2FA(dto.userId, dto.token);
  }

  @Get("2fa/setup")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Configurer 2FA (QR Code)" })
  async setup2FA(@Request() req: { user: { id: string } }) {
    return this.authService.setup2FA(req.user.id);
  }

  @Post("2fa/enable")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Activer 2FA" })
  async enable2FA(@Request() req: { user: { id: string } }, @Body() dto: Enable2FADto) {
    return this.authService.enable2FA(req.user.id, dto.token);
  }

  @Patch("password")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Changer le mot de passe" })
  async changePassword(@Request() req: { user: { id: string } }, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, dto.currentPassword, dto.newPassword);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Profil de l'utilisateur connecté" })
  async me(@Request() req: { user: object }) {
    return req.user;
  }
}
