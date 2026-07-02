import { Module } from '@nestjs/common';
import { TechniciensController } from './techniciens.controller';
import { TechniciensService } from './techniciens.service';

@Module({
  controllers: [TechniciensController],
  providers: [TechniciensService],
  exports: [TechniciensService],
})
export class TechniciensModule {}
