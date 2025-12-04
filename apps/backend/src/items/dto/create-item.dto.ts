import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsArray, IsUUID } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  pricePerDay: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  securityDeposit?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  stock?: number;

  @IsString()
  @IsOptional()
  condition?: string; // e.g. "GOOD", "FAIR"

  @IsArray()
  @IsString({ each: true }) // Memastikan setiap item di array adalah string
  @IsOptional()
  images?: string[];

  // Kita validasi ownerId harus format UUID yang valid
  @IsString()
  @IsUUID() 
  @IsNotEmpty()
  ownerId: string;
}