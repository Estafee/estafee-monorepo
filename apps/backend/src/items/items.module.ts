// apps/backend/src/items/items.module.ts
import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { PrismaService } from '../prisma.service'; // <-- Import Prisma

@Module({
  controllers: [ItemsController],
  providers: [ItemsService, PrismaService], // <-- Tambahkan PrismaService
})
export class ItemsModule {}