import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService) {
    super({
      datasources: { db: { url: config.get<string>('DATABASE_URL') } },
      log:
        config.get('NODE_ENV') === 'development'
          ? ['query', 'warn', 'error']
          : ['warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /** Soft-delete helper: sets deletedAt instead of removing rows */
  async softDelete(model: string, where: Record<string, unknown>) {
    return (this as any)[model].update({
      where,
      data: { deletedAt: new Date() },
    });
  }

  /** Exclude deleted records by default (use in $extends if needed) */
  excludeDeleted<T extends { deletedAt?: Date | null }>(records: T[]): T[] {
    return records.filter((r) => !r.deletedAt);
  }
}
