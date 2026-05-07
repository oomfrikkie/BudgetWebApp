import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Alex Johnson' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'alex@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 2800 })
  @IsNumber()
  @IsOptional()
  estimatedSalary?: number;

  @ApiPropertyOptional({ example: 17.5 })
  @IsNumber()
  @IsOptional()
  hourlyRate?: number;

  @ApiPropertyOptional({ example: 40 })
  @IsNumber()
  @IsOptional()
  hoursPerWeek?: number;
}
