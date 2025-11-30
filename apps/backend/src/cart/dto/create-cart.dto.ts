export class CreateCartDto {
  userId: string;
  itemId: string;
  quantity: number;
  startDate: string; // Dikirim dalam format string tanggal (ISO)
  endDate: string;
}