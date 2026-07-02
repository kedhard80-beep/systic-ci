import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;        // userId
  email: string;
  role: string;
  tenantId: string;
  twoFAVerified?: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'CHANGE_ME_IN_PRODUCTION'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        isActive: true,
        twoFAEnabled: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Compte inactif ou inexistant');
    }

    // If 2FA is enabled for user and token doesn't have 2FA verified flag
    if (user.twoFAEnabled && !payload.twoFAVerified) {
      throw new UnauthorizedException('Vérification 2FA requise');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
  }
}
