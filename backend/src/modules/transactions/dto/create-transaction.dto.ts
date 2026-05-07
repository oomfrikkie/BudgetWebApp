import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { TransactionType } from '../../../entities/transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({ example: '00000000-0000-0000-0000-000000000001' })
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiPropertyOptional({ example: 'grocery' })
  @IsString()
  @IsOptional()
  categoryId?: string | null;

  @ApiProperty({ example: 62.5 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'Weekly groceries' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '2026-05-03' })
  @IsDateString()
  date: string;
}
