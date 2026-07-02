import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // Utilitaire : exécute une promesse et retourne un défaut si elle échoue
  private async safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
    try {
      return await promise;
    } catch {
      return fallback;
    }
  }

  // ===== SUPER ADMIN DASHBOARD =====
  async getSuperAdminDashboard() {
    const now = new Date();
    const startMonth = startOfMonth(now);
    const endMonth = endOfMonth(now);
    const lastMonth = startOfMonth(subMonths(now, 1));

    const [
      totalClients,
      newClientsThisMonth,
      totalQuotes,
      quotesThisMonth,
      revenueThisMonth,
      revenueLastMonth,
      totalInterventions,
      interventionsThisMonth,
      pendingTickets,
      activeTechniciens,
      totalStudents,
      recentActivities,
    ] = await Promise.all([
      this.safe(this.prisma.client.count(), 0),
      this.safe(
        this.prisma.client.count({
          where: { createdAt: { gte: startMonth, lte: endMonth } },
        }),
        0,
      ),
      this.safe(this.prisma.quote.count(), 0),
      this.safe(
        this.prisma.quote.count({ where: { createdAt: { gte: startMonth } } }),
        0,
      ),
      this.safe(
        this.prisma.invoice.aggregate({
          where: { createdAt: { gte: startMonth }, status: { not: "ANNULEE" } },
          _sum: { totalTTC: true },
        }),
        { _sum: { totalTTC: 0 } },
      ),
      this.safe(
        this.prisma.invoice.aggregate({
          where: {
            createdAt: { gte: lastMonth, lt: startMonth },
            status: { not: "ANNULEE" },
          },
          _sum: { totalTTC: true },
        }),
        { _sum: { totalTTC: 0 } },
      ),
      this.safe(this.prisma.intervention.count(), 0),
      this.safe(
        this.prisma.intervention.count({
          where: { scheduledAt: { gte: startMonth } },
        }),
        0,
      ),
      this.safe(
        this.prisma.ticket.count({ where: { status: "OUVERT" } }),
        0,
      ),
      this.safe(
        this.prisma.technicien.count({ where: { isAvailable: true } }),
        0,
      ),
      this.safe(this.prisma.etudiant.count(), 0),
      this.safe(
        this.prisma.auditLog.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        }),
        [],
      ),
    ]);

    const currentRevenue = ((revenueThisMonth as any)._sum?.totalTTC as number) || 0;
    const lastRevenue = ((revenueLastMonth as any)._sum?.totalTTC as number) || 0;
    const revenueGrowth =
      lastRevenue > 0
        ? ((currentRevenue - lastRevenue) / lastRevenue) * 100
        : 0;

    // Monthly revenue trend (last 12 months)
    const revenueTrend = await this.getRevenueTrend(12);

    // Quote conversion rate
    const [acceptedQuotes, totalQuoteCount] = await Promise.all([
      this.safe(
        this.prisma.quote.count({ where: { status: { in: ["ACCEPTE", "CONVERTI"] } } }),
        0,
      ),
      this.safe(this.prisma.quote.count(), 0),
    ]);
    const conversionRate =
      totalQuoteCount > 0 ? (acceptedQuotes / totalQuoteCount) * 100 : 0;

    return {
      kpis: {
        revenue: {
          current: currentRevenue,
          growth: revenueGrowth,
          currency: "XOF",
        },
        clients: {
          total: totalClients,
          new: newClientsThisMonth,
        },
        quotes: {
          total: totalQuotes,
          thisMonth: quotesThisMonth,
          conversionRate: Math.round(conversionRate),
        },
        interventions: {
          total: totalInterventions,
          thisMonth: interventionsThisMonth,
        },
        tickets: {
          pending: pendingTickets,
        },
        techniciens: {
          active: activeTechniciens,
        },
        students: {
          total: totalStudents,
        },
      },
      revenueTrend,
      recentActivities,
    };
  }

  // ===== CLIENT DASHBOARD =====
  async getClientDashboard(clientId: string) {
    const [
      activeContracts,
      pendingInvoices,
      openTickets,
      recentInterventions,
      nextMaintenance,
    ] = await Promise.all([
      this.safe(
        this.prisma.contract.count({ where: { clientId, status: "ACTIF" } }),
        0,
      ),
      this.safe(
        this.prisma.invoice.findMany({
          where: {
            clientId,
            status: { in: ["EN_ATTENTE" as any, "EN_RETARD" as any] },
          },
          orderBy: { dueDate: "asc" },
          take: 5,
        }),
        [],
      ),
      this.safe(
        this.prisma.ticket.count({
          where: { clientId, status: "OUVERT" as any },
        }),
        0,
      ),
      this.safe(
        this.prisma.intervention.findMany({
          where: { clientId, completedAt: { not: null } },
          orderBy: { completedAt: "desc" },
          take: 5,
          include: {
            techniciens: {
              take: 1,
              include: {
                technicien: {
                  include: {
                    user: { select: { firstName: true, lastName: true } },
                  },
                },
              },
            },
          },
        }),
        [],
      ),
      this.safe(
        this.prisma.maintenance.findFirst({
          where: {
            contract: { clientId },
            status: "PLANIFIEE" as any,
            scheduledAt: { gte: new Date() },
          },
          orderBy: { scheduledAt: "asc" },
        }),
        null,
      ),
    ]);

    return {
      activeContracts,
      pendingInvoices,
      openTickets,
      recentInterventions,
      nextMaintenance,
    };
  }

  // ===== TECHNICIEN DASHBOARD =====
  async getTechnicienDashboard(technicienId: string) {
    const now = new Date();
    const startDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0, 0, 0,
    );
    const endDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23, 59, 59,
    );
    const startMonth = startOfMonth(now);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      todayInterventions,
      weekInterventions,
      completedThisMonth,
      pendingReports,
    ] = await Promise.all([
      this.safe(
        this.prisma.intervention.findMany({
          where: {
            techniciens: { some: { technicienId } },
            scheduledAt: { gte: startDay, lte: endDay },
            status: {
              in: ["PLANIFIEE" as any, "EN_ROUTE" as any, "EN_COURS" as any],
            },
          },
          include: {
            client: { select: { nom: true, adresse: true } },
          },
          orderBy: { scheduledAt: "asc" },
        }),
        [],
      ),
      this.safe(
        this.prisma.intervention.count({
          where: {
            techniciens: { some: { technicienId } },
            scheduledAt: { gte: sevenDaysAgo },
          },
        }),
        0,
      ),
      this.safe(
        this.prisma.intervention.count({
          where: {
            techniciens: { some: { technicienId } },
            status: "TERMINEE" as any,
            completedAt: { gte: startMonth },
          },
        }),
        0,
      ),
      this.safe(
        this.prisma.intervention.count({
          where: {
            techniciens: { some: { technicienId } },
            status: "TERMINEE" as any,
            rapport: null,
          },
        }),
        0,
      ),
    ]);

    return {
      todayInterventions,
      weekInterventions,
      completedThisMonth,
      pendingReports,
    };
  }

  // ===== REVENUE TREND =====
  private async getRevenueTrend(months: number) {
    const trend = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      try {
        const result = await this.prisma.invoice.aggregate({
          where: {
            createdAt: { gte: start, lte: end },
            status: { not: "ANNULEE" },
          },
          _sum: { totalTTC: true },
        });

        trend.push({
          month: start.toISOString().slice(0, 7),
          revenue: (result._sum.totalTTC as number) || 0,
        });
      } catch {
        trend.push({
          month: start.toISOString().slice(0, 7),
          revenue: 0,
        });
      }
    }
    return trend;
  }
}
