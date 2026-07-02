import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType, Prisma } from '@prisma/client';

export interface CreateNotificationDto {
  tenantId: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
  link?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    try {
      return await this.prisma.notification.create({
        data: {
          tenantId: dto.tenantId,
          userId: dto.userId,
          type: dto.type as NotificationType,
          title: dto.title,
          body: dto.body,
          metadata: (dto.metadata ?? {}) as Prisma.InputJsonObject,
          link: dto.link,
          read: false,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create notification', error);
    }
  }

  async createMany(notifications: CreateNotificationDto[]) {
    const created = await Promise.allSettled(notifications.map((n) => this.create(n)));
    return created.filter((r) => r.status === 'fulfilled').length;
  }

  async findAll(
    userId: string,
    tenantId: string,
    params: { page?: number; limit?: number; unreadOnly?: boolean },
  ) {
    const { page = 1, limit = 20, unreadOnly } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      userId,
      tenantId,
      ...(unreadOnly && { read: false }),
    };

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, tenantId, read: false } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit), unreadCount } };
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string, tenantId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, tenantId, read: false },
      data: { read: true, readAt: new Date() },
    });
  }

  async getUnreadCount(userId: string, tenantId: string) {
    return this.prisma.notification.count({
      where: { userId, tenantId, read: false },
    });
  }

  async delete(id: string, userId: string) {
    return this.prisma.notification.deleteMany({
      where: { id, userId },
    });
  }
}
