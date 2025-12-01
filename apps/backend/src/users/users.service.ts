import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Ambil semua user
  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' }, // Urutkan dari yang terbaru
    });
  }

  // Ambil 1 user berdasarkan ID (termasuk barang & sewaannya)
  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        items: true,            // Barang yang dia sewakan
        rentalsAsLendee: true,  // Riwayat dia menyewa
      },
    });
  }
}