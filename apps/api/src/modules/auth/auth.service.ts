import {
  Injectable, UnauthorizedException, BadRequestException,
  ConflictException, NotFoundException, ForbiddenException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import * as speakeasy from "speakeasy";
import * as qrcode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import { UserRole } from "@prisma/client";

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  tenantId: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;
  private readonly REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ===== LOGIN =====
  async login(email: string, password: string): Promise<TokenPair & { user: object; requires2FA?: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException("Identifiants incorrects");
    }

    if (!user.isActive) {
      throw new ForbiddenException("Compte désactivé. Contactez l'administrateur.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Identifiants incorrects");
    }

    // 2FA check
    if (user.twoFAEnabled) {
      return {
        accessToken: "",
        refreshToken: "",
        user: { id: user.id, email: user.email },
        requires2FA: true,
      };
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Audit log
    await this.createAuditLog(user.id, "AUTH_LOGIN", "user", user.id);

    const tokens = await this.generateTokenPair(user);
    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  // ===== VERIFY 2FA =====
  async verify2FA(userId: string, token: string): Promise<TokenPair & { user: object }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFASecret) {
      throw new UnauthorizedException("Utilisateur non trouvé");
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token,
      window: 2,
    });

    if (!isValid) {
      throw new UnauthorizedException("Code 2FA invalide");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokenPair(user);
    return { ...tokens, user: this.sanitizeUser(user) };
  }

  // ===== REGISTER =====
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    tenantId: string;
    role?: UserRole;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException("Un compte avec cet email existe déjà");
    }

    const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        tenantId: data.tenantId,
        role: data.role || UserRole.CLIENT,
      },
    });

    await this.createAuditLog(user.id, "AUTH_REGISTER", "user", user.id);

    const tokens = await this.generateTokenPair(user);
    return { ...tokens, user: this.sanitizeUser(user) };
  }

  // ===== REFRESH TOKEN =====
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh token invalide ou expiré");
    }

    if (!storedToken.user.isActive) {
      throw new ForbiddenException("Compte désactivé");
    }

    // Revoke old token (rotation)
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    return this.generateTokenPair(storedToken.user);
  }

  // ===== LOGOUT =====
  async logout(refreshToken: string, userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken, userId },
      data: { revokedAt: new Date() },
    });
    await this.createAuditLog(userId, "AUTH_LOGOUT", "user", userId);
  }

  // ===== SETUP 2FA =====
  async setup2FA(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("Utilisateur non trouvé");

    const secret = speakeasy.generateSecret({
      name: `SYSTIC-CI (${user.email})`,
      issuer: "SYSTIC-CI",
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFASecret: secret.base32 },
    });

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);
    return { secret: secret.base32, qrCode: qrCodeUrl };
  }

  // ===== ENABLE 2FA =====
  async enable2FA(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFASecret) throw new BadRequestException("2FA non configuré");

    const isValid = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token,
    });

    if (!isValid) throw new BadRequestException("Code invalide");

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFAEnabled: true },
    });

    return { message: "2FA activé avec succès" };
  }

  // ===== CHANGE PASSWORD =====
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("Utilisateur non trouvé");

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new UnauthorizedException("Mot de passe actuel incorrect");

    const hashedNew = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedNew },
    });

    // Revoke all refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await this.createAuditLog(userId, "AUTH_PASSWORD_CHANGE", "user", userId);
    return { message: "Mot de passe modifié avec succès" };
  }

  // ===== VALIDATE JWT PAYLOAD =====
  async validatePayload(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) return null;
    return user;
  }

  // ===== HELPERS =====
  private async generateTokenPair(user: { id: string; email: string; role: UserRole; tenantId: string }): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get("JWT_SECRET"),
        expiresIn: this.config.get("JWT_EXPIRES_IN", "15m"),
      }),
      this.generateRefreshToken(user.id),
    ]);

    return { accessToken, refreshToken };
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + this.REFRESH_TOKEN_EXPIRY);

    await this.prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });

    return token;
  }

  private sanitizeUser(user: { id: string; email: string; firstName: string; lastName: string; role: UserRole; tenantId: string; avatar?: string | null }) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tenantId: user.tenantId,
      avatar: user.avatar,
    };
  }

  private async createAuditLog(userId: string, action: string, entity: string, entityId: string) {
    try {
      await this.prisma.auditLog.create({
        data: { userId, action, entity, entityId },
      });
    } catch {
      // Non-blocking
    }
  }
}
