import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { UpsertBudgetDto } from './dto/upsert-budget.dto';

@ApiTags('Budgets')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  @ApiOperation({ summary: 'List budgets, optionally filtered by userId' })
  @ApiQuery({ name: 'userId', required: false })
  findAll(@Query('userId') userId?: string) {
    return this.budgetsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a budget by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.budgetsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a budget limit' })
  create(@Body() dto: CreateBudgetDto) {
    return this.budgetsService.create(dto);
  }

  @Post('upsert')
  @ApiOperation({ summary: 'Create or update a budget limit for a category' })
  upsert(@Body() dto: UpsertBudgetDto) {
    return this.budgetsService.upsert(dto.userId, dto.categoryId, dto.amount);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a budget' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBudgetDto) {
    return this.budgetsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.budgetsService.remove(id);
  }
}
