import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateBudgetDto {
  @ApiProperty({ example: '00000000-0000-0000-0000-000000000001' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'grocery' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 300 })
  @IsNumber()
  amount: number;
}
