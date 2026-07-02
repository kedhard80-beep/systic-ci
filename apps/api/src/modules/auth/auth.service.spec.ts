/**
 * SYSTIC-CI — Tests unitaires Auth Service
 */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockUser = {
  id: 'user-1',
  email: 'admin@systic.ci',
  passwordHash: '',
  firstName: 'Admin',
  lastName: 'SYSTIC',
  role: 'SUPER_ADMIN',
  tenantId: 'tenant-1',
  isActive: true,
  isVerified: true,
  twoFAEnabled: false,
  twoFASecret: null,
  refreshToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginAt: null,
  avatar: null,
  phone: null,
  tenant: { id: 'tenant-1', name: 'SYSTIC-CI' },
};

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
  tenant: {
    findFirst: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn(() => 'mock-jwt-token'),
  signAsync: jest.fn(() => Promise.resolve('mock-jwt-token')),
  verify: jest.fn(),
  verifyAsync: jest.fn(),
};

const mockConfig = {
  get: jest.fn((key: string) => {
    const map: Record<string, string> = {
      'JWT_SECRET': 'test-secret',
      'JWT_REFRESH_SECRET': 'test-refresh-secret',
      'JWT_EXPIRES_IN': '15m',
      'JWT_REFRESH_EXPIRES_IN': '7d',
    };
    return map[key] ?? null;
  }),
};

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;

  beforeAll(async () => {
    // Pré-générer le hash une seule fois
    mockUser.passwordHash = await bcrypt.hash('Test@Systic2024!', 10);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ── login ──────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('retourne les tokens pour des identifiants valides', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.login('admin@systic.ci', 'Test@Systic2024!');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('lève UnauthorizedException si email inconnu', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login('inconnu@test.com', 'pass'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lève UnauthorizedException si mot de passe incorrect', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.login('admin@systic.ci', 'mauvais-mdp'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lève ForbiddenException si compte inactif', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(
        service.login('admin@systic.ci', 'Test@Systic2024!'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ── register ───────────────────────────────────────────────────────────────

  describe('register()', () => {
    const dto = {
      email: 'nouveau@test.ci',
      password: 'Password@123',
      firstName: 'Nouveau',
      lastName: 'User',
      tenantId: 'tenant-1',
    };

    it('crée un utilisateur et retourne les tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.tenant.findFirst.mockResolvedValue({ id: 'tenant-1' });
      mockPrisma.user.create.mockResolvedValue({ ...mockUser, email: dto.email });
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, email: dto.email });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.register(dto);

      expect(result).toHaveProperty('accessToken');
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('lève ConflictException si email déjà utilisé', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });
});
