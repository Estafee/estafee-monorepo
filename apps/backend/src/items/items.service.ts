import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async create(createItemDto: CreateItemDto) {
    // Kita gunakan 'as any' sementara karena DTO manual kita belum 100% sama dengan type Prisma
    return this.prisma.item.create({
      data: createItemDto as any,
    });
  }

  async findAll() {
    return this.prisma.item.findMany({
      include: { owner: true }
    });
  }

  async findOne(id: string) {
    return this.prisma.item.findUnique({
      where: { id },
      include: { owner: true, rentalItems: true } // Pastikan 'rentalItems' sesuai schema
    });
  }

  async update(id: string, updateItemDto: UpdateItemDto) {
    return this.prisma.item.update({
      where: { id },
      data: updateItemDto as any,
    });
  }

  async remove(id: string) {
    return this.prisma.item.delete({
      where: { id },
    });
  }
}