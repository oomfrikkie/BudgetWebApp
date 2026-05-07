import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'grocery' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'Grocery' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ example: '🛒' })
  @IsString()
  @IsNotEmpty()
  emoji: string;

  @ApiProperty({ example: '#22c55e' })
  @IsString()
  @IsNotEmpty()
  color: string;
}
