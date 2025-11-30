import { Controller, Get, Param } from '@nestjs/common';
import { RentalsService } from './rentals.service';

@Controller()
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Get()
  findAll() {
    return this.rentalsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rentalsService.findOne(id);
  }
}