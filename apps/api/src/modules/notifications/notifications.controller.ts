import { Controller, Get, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List my notifications' })
  findAll(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.svc.findAll(userId, tenantId, {
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
      unreadOnly: unreadOnly === 'true',
    });
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  unreadCount(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.svc.getUnreadCount(userId, tenantId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.svc.markAsRead(id, userId);
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.svc.markAllAsRead(userId, tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.svc.delete(id, userId);
  }
}
