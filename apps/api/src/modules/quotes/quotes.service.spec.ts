/**
 * SYSTIC-CI — Tests unitaires Quotes Service (Devis)
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { QuoteStatus } from '@prisma/client';

const TENANT_ID = 'tenant-1';
const USER_ID   = 'user-1';
const QUOTE_ID  = 'quote-1';

const mockQuote = {
  id: QUOTE_ID,
  tenantId: TENANT_ID,
  reference: 'DEV-2024-0001',
  clientId: 'client-1',
  status: QuoteStatus.BROUILLON,
  totalHT: 1_000_000,
  totalTVA: 180_000,
  totalTTC: 1_180_000,
  tvaRate: 18,
  validUntil: new Date(Date.now() + 30 * 86_400_000),
  titre: 'Installation système de sécurité',
  description: null,
  notes: null,
  createdBy: USER_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [],
  client: { id: 'client-1', nom: 'Groupe Pétrolier CI' },
  creator: { id: USER_ID, firstName: 'Admin', lastName: 'SYSTIC' },
};

const mockPrisma = {
  quote: {
    findMany:  jest.fn(),
    findFirst: jest.fn(),
    create:    jest.fn(),
    update:    jest.fn(),
    count:     jest.fn(),
  },
  quoteItem: {
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  contract: { create: jest.fn() },
  auditLog: { create: jest.fn() },
  // Prisma $transaction : exécute le tableau d'opérations et retourne leurs résultats
  $transaction: jest.fn((ops: unknown[]) => Promise.all(ops)),
};

const mockNotifications = {
  create: jest.fn(),
  sendEmail: jest.fn(),
};

describe('QuotesService', () => {
  let service: QuotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotesService,
        { provide: PrismaService,        useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotifications },
      ],
    }).compile();

    service = module.get<QuotesService>(QuotesService);
    jest.clearAllMocks();
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('retourne la liste paginée des devis', async () => {
      mockPrisma.quote.findMany.mockResolvedValue([mockQuote]);
      mockPrisma.quote.count.mockResolvedValue(1);

      const result = await service.findAll(TENANT_ID, {});

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('retourne le devis si trouvé', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue(mockQuote);
      const result = await service.findOne(QUOTE_ID, TENANT_ID);
      expect(result.reference).toBe('DEV-2024-0001');
    });

    it('lève NotFoundException si devis introuvable', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue(null);
      await expect(service.findOne('inexistant', TENANT_ID)).rejects.toThrow(NotFoundException);
    });
  });

  // ── updateStatus — transitions valides ─────────────────────────────────────

  describe('updateStatus()', () => {
    it('BROUILLON → ENVOYE est valide', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue({ ...mockQuote, status: QuoteStatus.BROUILLON });
      mockPrisma.quote.update.mockResolvedValue({ ...mockQuote, status: QuoteStatus.ENVOYE });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.updateStatus(QUOTE_ID, TENANT_ID, QuoteStatus.ENVOYE, USER_ID);
      expect(result.status).toBe(QuoteStatus.ENVOYE);
    });

    it('ENVOYE → ACCEPTE est valide', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue({ ...mockQuote, status: QuoteStatus.ENVOYE });
      mockPrisma.quote.update.mockResolvedValue({ ...mockQuote, status: QuoteStatus.ACCEPTE });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.updateStatus(QUOTE_ID, TENANT_ID, QuoteStatus.ACCEPTE, USER_ID);
      expect(result.status).toBe(QuoteStatus.ACCEPTE);
    });

    it('ACCEPTE → BROUILLON est invalide (transition interdite)', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue({ ...mockQuote, status: QuoteStatus.ACCEPTE });

      await expect(
        service.updateStatus(QUOTE_ID, TENANT_ID, QuoteStatus.BROUILLON, USER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('CONVERTI → tout est invalide (état terminal)', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue({ ...mockQuote, status: QuoteStatus.CONVERTI });

      await expect(
        service.updateStatus(QUOTE_ID, TENANT_ID, QuoteStatus.ENVOYE, USER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('lève NotFoundException si devis introuvable', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue(null);

      await expect(
        service.updateStatus('inexistant', TENANT_ID, QuoteStatus.ENVOYE, USER_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── convertToContract ──────────────────────────────────────────────────────

  describe('convertToContract()', () => {
    it('convertit un devis ACCEPTE en contrat', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue({ ...mockQuote, status: QuoteStatus.ACCEPTE });
      mockPrisma.contract.create.mockResolvedValue({ id: 'contract-1' });
      mockPrisma.quote.update.mockResolvedValue({ ...mockQuote, status: QuoteStatus.CONVERTI });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.convertToContract(QUOTE_ID, TENANT_ID, USER_ID);

      expect(mockPrisma.contract.create).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('id', 'contract-1');
    });

    it('lève BadRequestException si le devis n\'est pas ACCEPTE', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue({ ...mockQuote, status: QuoteStatus.BROUILLON });

      await expect(
        service.convertToContract(QUOTE_ID, TENANT_ID, USER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('lève NotFoundException si devis introuvable', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue(null);

      await expect(
        service.convertToContract('inexistant', TENANT_ID, USER_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
