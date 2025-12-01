import { Module } from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { RentalsController } from './rentals.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [RentalsController],
  providers: [RentalsService, PrismaService], // <-- Tambahkan PrismaService
})
export class RentalsModule {}