import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { TopUpDto } from './dto/topup.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    console.log('GET /api/users/:id response:', {
      id: user?.id,
      name: user?.name,
      balance: user?.balance,
      balanceType: typeof user?.balance,
    });
    return user;
  }

  @Post(':id/topup')
  async topUp(@Param('id') id: string, @Body() topUpDto: TopUpDto) {
    console.log('Top-up request received:', { id, topUpDto });
    try {
      const result = await this.usersService.topUp(id, topUpDto.amount);
      console.log('Top-up successful:', result);
      return result;
    } catch (error) {
      console.error('Top-up error:', error);
      throw error;
    }
  }
}
