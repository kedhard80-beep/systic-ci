import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { InterventionsModule } from './modules/interventions/interventions.module';
import { AcademieModule } from './modules/academie/academie.module';
import { AiModule } from './modules/ai/ai.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { StorageModule } from './modules/storage/storage.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { BlogModule } from './modules/blog/blog.module';
import { CareersModule } from './modules/careers/careers.module';
import { SettingsModule } from './modules/settings/settings.module';
import { CrmModule } from './modules/crm/crm.module';
import { ProductsModule } from './modules/products/products.module';
import { StocksModule } from './modules/stocks/stocks.module';
import { TechniciensModule } from './modules/techniciens/techniciens.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({ isGlobal: true, cache: true }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ([{
        ttl: 60000,
        limit: config.get<number>('RATE_LIMIT_MAX', 100),
      }]),
    }),

    // Cron jobs
    ScheduleModule.forRoot(),

    // Core
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ClientsModule,
    QuotesModule,
    ContractsModule,
    InvoicesModule,
    InterventionsModule,
    AcademieModule,
    AiModule,
    DashboardModule,
    NotificationsModule,
    StorageModule,
    PaymentsModule,
    TicketsModule,
    BlogModule,
    CareersModule,
    SettingsModule,
    CrmModule,
    ProductsModule,
    StocksModule,
    TechniciensModule,
    ProjectsModule,
    PortfolioModule,
    MediaModule,
  ],
})
export class AppModule {}
