import { Module } from '@nestjs/common';
import { AcademieService } from './academie.service';
import { AcademieController } from './academie.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [NotificationsModule, StorageModule],
  controllers: [AcademieController],
  providers: [AcademieService],
  exports: [AcademieService],
})
export class AcademieModule {}
