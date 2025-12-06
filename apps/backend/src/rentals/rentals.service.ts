import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRentalDto } from './dto/create-rental.dto';

@Injectable()
export class RentalsService {
  constructor(private prisma: PrismaService) {}

  async create(createRentalDto: CreateRentalDto) {
    const {
      itemIds,
      lendeeId,
      lenderId,
      startDate,
      endDate,
      totalPrice,
      totalDeposit,
    } = createRentalDto;

    // Verify items exist and are available
    const items = await this.prisma.item.findMany({
      where: { id: { in: itemIds } },
    });

    if (items.length !== itemIds.length) {
      throw new BadRequestException('Some items not found');
    }

    // Check availability
    const unavailableItems = items.filter((item) => !item.isAvailable);
    if (unavailableItems.length > 0) {
      throw new BadRequestException('Some items are not available');
    }

    // Calculate rental days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Create rental with rental items
    const rental = await this.prisma.rental.create({
      data: {
        lendeeId,
        lenderId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalPrice,
        totalDeposit,
        status: 'WAITING_APPROVAL',
        items: {
          create: itemIds.map((itemId) => {
            const item = items.find((i) => i.id === itemId);
            if (!item) {
              throw new BadRequestException(`Item ${itemId} not found`);
            }

            const pricePerDay = Number(item.pricePerDay);
            const subtotal = pricePerDay * days;

            return {
              itemId,
              quantity: 1,
              priceAtRental: pricePerDay,
              subtotal: subtotal,
            };
          }),
        },
      },
      include: {
        lender: true,
        lendee: true,
        items: { include: { item: true } },
      },
    });

    // Update item availability (mark as borrowed)
    await this.prisma.item.updateMany({
      where: { id: { in: itemIds } },
      data: { isAvailable: false },
    });

    return rental;
  }

  async findAll() {
    return this.prisma.rental.findMany({
      include: {
        lender: true,
        lendee: true,
        items: {
          include: { item: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const rental = await this.prisma.rental.findUnique({
      where: { id },
      include: {
        lender: true,
        lendee: true,
        items: { include: { item: true } },
      },
    });

    if (!rental) {
      throw new NotFoundException('Rental not found');
    }

    return rental;
  }

  async findByUser(userId: string) {
    return this.prisma.rental.findMany({
      where: {
        OR: [{ lendeeId: userId }, { lenderId: userId }],
      },
      include: {
        lender: true,
        lendee: true,
        items: { include: { item: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByLender(lenderId: string) {
    return this.prisma.rental.findMany({
      where: { lenderId },
      include: {
        lender: true,
        lendee: true,
        items: { include: { item: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByLendee(lendeeId: string) {
    return this.prisma.rental.findMany({
      where: { lendeeId },
      include: {
        lender: true,
        lendee: true,
        items: { include: { item: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(id: string) {
    // Get rental details first
    const rental = await this.prisma.rental.findUnique({
      where: { id },
      include: {
        lendee: true,
        items: { include: { item: true } },
      },
    });

    if (!rental) {
      throw new NotFoundException('Rental not found');
    }

    if (rental.status !== 'WAITING_APPROVAL') {
      throw new BadRequestException('Rental is not in waiting approval status');
    }

    // Calculate total amount (rental price + deposit) - convert Decimal to number
    const totalAmount = Number(rental.totalPrice) + Number(rental.totalDeposit);
    const currentBalance = Number(rental.lendee.balance);

    console.log('=== RENTAL APPROVAL DEBUG ===');
    console.log('Rental ID:', id);
    console.log('Lendee ID:', rental.lendeeId);
    console.log('Current Balance:', currentBalance);
    console.log('Total Price:', Number(rental.totalPrice));
    console.log('Total Deposit:', Number(rental.totalDeposit));
    console.log('Total Amount to Deduct:', totalAmount);
    console.log('===========================');

    // Check if lendee has enough balance
    if (currentBalance < totalAmount) {
      throw new BadRequestException(
        `Insufficient balance. Required: ${totalAmount}, Available: ${currentBalance}`,
      );
    }

    // Use transaction to ensure atomicity
    const result = await this.prisma.$transaction(async (tx) => {
      // Deduct balance from lendee
      const updatedUser = await tx.user.update({
        where: { id: rental.lendeeId },
        data: {
          balance: {
            decrement: totalAmount,
          },
        },
      });

      console.log('User balance after update:', Number(updatedUser.balance));

      // Update rental status
      return tx.rental.update({
        where: { id },
        data: { status: 'APPROVED' },
        include: {
          lender: true,
          lendee: true,
          items: { include: { item: true } },
        },
      });
    });

    console.log('Transaction completed successfully');
    return result;
  }

  async reject(id: string, reason?: string) {
    const rental = await this.prisma.rental.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
      },
      include: {
        items: true,
      },
    });

    // Make items available again
    const itemIds = rental.items.map((ri) => ri.itemId);
    await this.prisma.item.updateMany({
      where: { id: { in: itemIds } },
      data: { isAvailable: true },
    });

    return rental;
  }

  async complete(id: string) {
    const rental = await this.prisma.rental.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: {
        items: true,
      },
    });

    // Make items available again
    const itemIds = rental.items.map((ri) => ri.itemId);
    await this.prisma.item.updateMany({
      where: { id: { in: itemIds } },
      data: { isAvailable: true },
    });

    return rental;
  }
}
