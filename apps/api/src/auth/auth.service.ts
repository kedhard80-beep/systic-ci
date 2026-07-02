import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../modules/users/users.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { UserRole } from '@prisma/client';
import {
  LoginDto,
  RegisterDto,
  TwoFAVerifyDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ===== LOGIN =====

  async login(dto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Identifiants incorrects');
    if (!user.isActive) throw new UnauthorizedException('Compte désactivé');

    const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordOk) throw new UnauthorizedException('Identifiants incorrects');

    // If 2FA enabled → return partial token (twoFARequired flag)
    if (user.twoFAEnabled) {
      const partialToken = this.jwt.sign(
        { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId, twoFAVerified: false },
        { expiresIn: '5m' },
      );
      return { twoFARequired: true, partialToken };
    }

    return this.generateTokens(user, dto.rememberMe);
  }

  // ===== 2FA VERIFY =====

  async verify2FA(userId: string, dto: TwoFAVerifyDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFASecret) throw new UnauthorizedException('2FA non configuré');

    const valid = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token: dto.code,
      window: 1, // allow 1 period tolerance
    });

    if (!valid) throw new UnauthorizedException('Code 2FA invalide');

    return this.generateTokens({ ...user, twoFAVerified: true }, false);
  }

  // ===== REGISTER =====

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (exists) throw new ConflictException(`Email ${dto.email} déjà utilisé`);

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        tenantId: 'default',
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email.toLowerCase(),
        passwordHash,
        role: UserRole.CLIENT,
        phone: dto.phone,
        isActive: true,
      },
    });

    return this.generateTokens(user, false);
  }

  // ===== REFRESH TOKEN =====

  async refreshToken(token: string) {
    try {
      const payload = this.jwt.verify(token, {
        secret: this.config.get('JWT_REFRESH_SECRET', 'REFRESH_CHANGE_ME'),
      });

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.isActive) throw new UnauthorizedException();

      return this.generateTokens(user, false);
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }
  }

  // ===== SETUP 2FA =====

  async setup2FA(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException();

    const secret = speakeasy.generateSecret({
      name: `SYSTIC-CI (${user.email})`,
      length: 20,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFASecret: secret.base32, twoFAEnabled: false },
    });

    const qrUrl = await qrcode.toDataURL(secret.otpauth_url!);

    return { secret: secret.base32, qrCode: qrUrl };
  }

  async enable2FA(userId: string, dto: TwoFAVerifyDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFASecret) throw new BadRequestException('2FA non initialisé');

    const valid = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token: dto.code,
      window: 1,
    });

    if (!valid) throw new BadRequestException('Code invalide');

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFAEnabled: true },
    });

    return { enabled: true };
  }

  async disable2FA(userId: string, dto: TwoFAVerifyDto) {
    await this.enable2FA(userId, dto); // validates code
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFAEnabled: false, twoFASecret: null },
    });
    return { enabled: false };
  }

  // ===== FORGOT / RESET PASSWORD =====

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // Always return success to prevent email enumeration
    if (!user) return { message: 'Si ce compte existe, un email a été envoyé.' };

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    // TODO: Send email via MailService
    this.logger.log(`Password reset token for ${user.email}: ${token}`);

    return { message: 'Si ce compte existe, un email a été envoyé.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.prisma.passwordResetToken.findFirst({
      where: { token: dto.token, expiresAt: { gt: new Date() }, usedAt: null },
    });

    if (!record) throw new BadRequestException('Token invalide ou expiré');

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await Promise.all([
      this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ]);

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException();

    const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Mot de passe actuel incorrect');

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    return { message: 'Mot de passe changé avec succès' };
  }

  // ===== TOKEN GENERATION =====

  private generateTokens(user: any, rememberMe?: boolean) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      twoFAVerified: user.twoFAEnabled ? (user.twoFAVerified ?? true) : true,
    };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_SECRET', 'CHANGE_ME'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '1h'),
    });

    const refreshToken = this.jwt.sign(
      { sub: user.id },
      {
        secret: this.config.get('JWT_REFRESH_SECRET', 'REFRESH_CHANGE_ME'),
        expiresIn: rememberMe ? '30d' : this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      },
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId,
      },
    };
  }
}
