import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface SettingValue {
  key: string;
  value: unknown;
  label?: string;
  group?: string;
}

const DEFAULT_SETTINGS: Record<string, unknown> = {
  'company.name': 'SYSTIC-CI',
  'company.email': 'contact@systic.ci',
  'company.phone': '01 73 03 25 25',
  'company.address': 'Angré GESTOCI, Cocody, Abidjan',
  'company.logo': '/images/logo-systic.png',
  'company.tvaRate': 0.18,
  'company.currency': 'XOF',
  'email.senderName': 'SYSTIC-CI',
  'email.senderEmail': 'noreply@systic.ci',
  'notification.emailEnabled': true,
  'notification.smsEnabled': false,
  'notification.whatsappEnabled': false,
  'quote.validityDays': 30,
  'invoice.dueDays': 30,
  'maintenance.renewalAlertDays': 30,
};

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(tenantId: string): Promise<Record<string, unknown>> {
    const rows = await this.prisma.setting.findMany({ where: { tenantId } });
    const result: Record<string, unknown> = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  }

  async get(tenantId: string, key: string): Promise<unknown> {
    const row = await this.prisma.setting.findFirst({ where: { tenantId, key } });
    return row?.value ?? DEFAULT_SETTINGS[key] ?? null;
  }

  async set(tenantId: string, key: string, value: unknown): Promise<void> {
    await this.prisma.setting.upsert({
      where: { tenantId_key: { tenantId, key } },
      update: { value: value as any },
      create: { tenantId, key, value: value as any },
    });
  }

  async setBulk(tenantId: string, settings: Record<string, unknown>): Promise<void> {
    await Promise.all(
      Object.entries(settings).map(([key, value]) => this.set(tenantId, key, value)),
    );
  }

  async delete(tenantId: string, key: string): Promise<void> {
    await this.prisma.setting.deleteMany({ where: { tenantId, key } });
  }

  async reset(tenantId: string): Promise<void> {
    await this.prisma.setting.deleteMany({ where: { tenantId } });
  }
}
