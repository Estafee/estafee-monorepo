import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsArray,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateRentalDto {
  @IsString()
  @IsNotEmpty()
  lendeeId: string; // User who is borrowing

  @IsString()
  @IsNotEmpty()
  lenderId: string; // Item owner

  @IsArray()
  @IsNotEmpty()
  itemIds: string[]; // Array of item IDs to rent

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @Min(0)
  totalPrice: number;

  @IsNumber()
  @Min(0)
  totalDeposit: number;
}
