import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PrismaService } from '../prisma.service'; // <-- 1. Import ini

@Module({
  controllers: [CartController],
  providers: [CartService, PrismaService], // <-- 2. Tambahkan di sini
})
export class CartModule {}