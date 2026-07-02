import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    StorageModule,
    MulterModule.register({ storage: memoryStorage() }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
