/**
 * SYSTIC-CI — Tests unitaires Clients Service
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { PrismaService } from '../../prisma/prisma.service';

const TENANT_ID = 'tenant-1';
const USER_ID   = 'user-1';
const CLIENT_ID = 'client-1';

const mockClient = {
  id: CLIENT_ID,
  tenantId: TENANT_ID,
  type: 'ENTREPRISE',
  nom: 'Groupe Pétrolier CI',
  email: 'contact@gp-ci.com',
  telephone: '+225 07 00 00 00',
  adresse: 'Plateau, Abidjan',
  secteurActivite: 'Énergie',
  statut: 'ACTIF',
  source: 'REFERRAL',
  deletedAt: null,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  contacts: [],
  activities: [],
  contracts: [],
  _count: { contacts: 0, activities: 0, contracts: 0, interventions: 0 },
};

const mockPrisma = {
  client: {
    findMany:   jest.fn(),
    findFirst:  jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
    count:      jest.fn(),
    aggregate:  jest.fn(),
  },
  activity:   { create: jest.fn() },
  contact:    { findFirst: jest.fn() },
  softDelete: jest.fn().mockResolvedValue({ id: CLIENT_ID }),
};

describe('ClientsService', () => {
  let service: ClientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    jest.clearAllMocks();
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('retourne la liste paginée des clients du tenant', async () => {
      mockPrisma.client.findMany.mockResolvedValue([mockClient]);
      mockPrisma.client.count.mockResolvedValue(1);

      const result = await service.findAll(TENANT_ID, {});

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(mockPrisma.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ tenantId: TENANT_ID }) }),
      );
    });

    it('passe le filtre secteur si fourni', async () => {
      mockPrisma.client.findMany.mockResolvedValue([]);
      mockPrisma.client.count.mockResolvedValue(0);

      await service.findAll(TENANT_ID, { secteur: 'Énergie' });

      expect(mockPrisma.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ secteur: 'Énergie' }),
        }),
      );
    });

    it('filtre par recherche textuelle si fournie', async () => {
      mockPrisma.client.findMany.mockResolvedValue([]);
      mockPrisma.client.count.mockResolvedValue(0);

      await service.findAll(TENANT_ID, { search: 'Pétrolier' });

      expect(mockPrisma.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ OR: expect.any(Array) }),
        }),
      );
    });
  });

  // ── findOne ────────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('retourne le client si trouvé', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(mockClient);

      const result = await service.findOne(CLIENT_ID, TENANT_ID);
      expect(result.id).toBe(CLIENT_ID);
    });

    it('lève NotFoundException si client introuvable', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(null);
      await expect(service.findOne('inexistant', TENANT_ID)).rejects.toThrow(NotFoundException);
    });
  });

  // ── create ─────────────────────────────────────────────────────────────────

  describe('create()', () => {
    const dto = { nom: 'Nouveau Client', email: 'client@test.ci', type: 'ENTREPRISE' as any };

    it('crée le client et génère une activité NOTE', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(null); // email unique check
      mockPrisma.client.create.mockResolvedValue({ ...mockClient, ...dto });
      mockPrisma.activity.create.mockResolvedValue({});

      // Signature réelle : create(tenantId, userId, dto)
      const result = await service.create(TENANT_ID, USER_ID, dto as any);

      expect(result.nom).toBe('Nouveau Client');
      expect(mockPrisma.client.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.activity.create).toHaveBeenCalledTimes(1);
    });

    it('lève ConflictException si email déjà utilisé dans le tenant', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(mockClient); // email existe

      await expect(service.create(TENANT_ID, USER_ID, dto as any)).rejects.toThrow(ConflictException);
    });
  });

  // ── update ─────────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('met à jour le client existant', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(mockClient);
      mockPrisma.client.update.mockResolvedValue({ ...mockClient, nom: 'Nom Modifié' });
      mockPrisma.activity.create.mockResolvedValue({});

      // Signature réelle : update(id, tenantId, userId, dto)
      const result = await service.update(CLIENT_ID, TENANT_ID, USER_ID, { nom: 'Nom Modifié' } as any);
      expect(result.nom).toBe('Nom Modifié');
    });

    it('lève NotFoundException si client introuvable', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(null);

      await expect(
        service.update('inexistant', TENANT_ID, USER_ID, { nom: 'x' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove ─────────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('supprime le client trouvé (soft delete)', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(mockClient);
      mockPrisma.softDelete.mockResolvedValue({ id: CLIENT_ID });

      await expect(service.remove(CLIENT_ID, TENANT_ID)).resolves.not.toThrow();
      expect(mockPrisma.softDelete).toHaveBeenCalledWith('client', { id: CLIENT_ID });
    });

    it('lève NotFoundException si client introuvable', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(null);
      await expect(service.remove('inexistant', TENANT_ID)).rejects.toThrow(NotFoundException);
    });
  });
});
