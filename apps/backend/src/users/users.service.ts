import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Create new user
  async create(createUserDto: CreateUserDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  // Find user by email
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Ambil semua user
  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' }, // Urutkan dari yang terbaru
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        address: true,
        phoneNumber: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password
      },
    });
  }

  // Ambil 1 user berdasarkan ID (termasuk barang & sewaannya)
  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        items: true, // Barang yang dia sewakan
        rentalsAsLendee: true, // Riwayat dia menyewa
      },
    });
  }

  // Top up user balance
  async topUp(id: string, amount: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
  }
}
