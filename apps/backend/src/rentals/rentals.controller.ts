import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { CreateRentalDto } from './dto/create-rental.dto';

@Controller()
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Post()
  create(@Body() createRentalDto: CreateRentalDto) {
    return this.rentalsService.create(createRentalDto);
  }

  @Get()
  findAll(
    @Query('lenderId') lenderId?: string,
    @Query('lendeeId') lendeeId?: string,
  ) {
    if (lenderId) {
      return this.rentalsService.findByLender(lenderId);
    }
    if (lendeeId) {
      return this.rentalsService.findByLendee(lendeeId);
    }
    return this.rentalsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rentalsService.findOne(id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.rentalsService.findByUser(userId);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.rentalsService.approve(id);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.rentalsService.reject(id, reason);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.rentalsService.complete(id);
  }
}
