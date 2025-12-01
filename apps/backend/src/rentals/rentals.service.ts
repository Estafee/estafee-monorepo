import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RentalsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.rental.findMany({
      include: {
        lender: true, // Siapa pemiliknya
        lendee: true, // Siapa penyewanya
        items: {      // Barang apa saja yg disewa
          include: { item: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.rental.findUnique({
      where: { id },
      include: { items: { include: { item: true } } }
    });
  }
}