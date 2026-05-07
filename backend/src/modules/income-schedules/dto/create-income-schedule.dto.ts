import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateIncomeScheduleDto {
  @ApiProperty({ example: '00000000-0000-0000-0000-000000000001' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'Monthly Salary' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ example: 2840 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 1, description: 'Day of month (1–31) when income is received' })
  @IsNumber()
  @Min(1)
  @Max(31)
  dayOfMonth: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
