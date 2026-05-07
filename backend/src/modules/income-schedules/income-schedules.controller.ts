import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IncomeSchedulesService } from './income-schedules.service';
import { CreateIncomeScheduleDto } from './dto/create-income-schedule.dto';
import { UpdateIncomeScheduleDto } from './dto/update-income-schedule.dto';

@ApiTags('Income Schedules')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('income-schedules')
export class IncomeSchedulesController {
  constructor(private readonly service: IncomeSchedulesService) {}

  @Get()
  @ApiOperation({ summary: 'List active income schedules, optionally filtered by userId' })
  @ApiQuery({ name: 'userId', required: false })
  findAll(@Query('userId') userId?: string) {
    return this.service.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an income schedule by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a recurring income schedule' })
  create(@Body() dto: CreateIncomeScheduleDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an income schedule' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateIncomeScheduleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an income schedule' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
