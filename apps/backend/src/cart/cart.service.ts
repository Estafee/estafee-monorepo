import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  // TAMBAH KE KERANJANG
  async create(createCartDto: CreateCartDto) {
    return this.prisma.cartItem.create({
      data: {
        userId: createCartDto.userId,
        itemId: createCartDto.itemId,
        quantity: createCartDto.quantity,
        startDate: new Date(createCartDto.startDate), // Convert string ke Date
        endDate: new Date(createCartDto.endDate),     // Convert string ke Date
      },
    });
  }

  // AMBIL SEMUA ISI KERANJANG (Bisa difilter per User)
  async findAll(userId?: string) {
    if (userId) {
      return this.prisma.cartItem.findMany({
        where: { userId },
        include: { item: true } // Tampilkan detail barangnya juga
      });
    }
    return this.prisma.cartItem.findMany({
      include: { item: true, user: true }
    });
  }

  // AMBIL 1 ITEM KERANJANG
  async findOne(id: string) {
    return this.prisma.cartItem.findUnique({
      where: { id },
      include: { item: true }
    });
  }

  // UPDATE (Misal: Ganti quantity atau tanggal)
  async update(id: string, updateCartDto: UpdateCartDto) {
    const data: any = { ...updateCartDto };
    
    // Jika ada update tanggal, convert lagi ke Date object
    if (updateCartDto.startDate) data.startDate = new Date(updateCartDto.startDate);
    if (updateCartDto.endDate) data.endDate = new Date(updateCartDto.endDate);

    return this.prisma.cartItem.update({
      where: { id },
      data,
    });
  }

  // HAPUS DARI KERANJANG
  async remove(id: string) {
    return this.prisma.cartItem.delete({
      where: { id },
    });
  }
}