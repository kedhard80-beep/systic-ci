import { Module } from '@nestjs/common';
import { InterventionsService } from './interventions.service';
import { InterventionsController } from './interventions.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [InterventionsController],
  providers: [InterventionsService],
  exports: [InterventionsService],
})
export class InterventionsModule {}
