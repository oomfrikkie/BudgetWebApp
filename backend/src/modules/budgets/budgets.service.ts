import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from '../../entities/budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(@InjectRepository(Budget) private readonly repo: Repository<Budget>) {}

  findAll(userId?: string) {
    const where = userId ? { userId } : {};
    return this.repo.find({ where, relations: ['category'] });
  }

  async findOne(id: number) {
    const budget = await this.repo.findOne({ where: { id }, relations: ['category'] });
    if (!budget) throw new NotFoundException(`Budget ${id} not found`);
    return budget;
  }

  create(dto: CreateBudgetDto) {
    const budget = this.repo.create(dto);
    return this.repo.save(budget);
  }

  async update(id: number, dto: UpdateBudgetDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const budget = await this.findOne(id);
    return this.repo.remove(budget);
  }

  async upsert(userId: string, categoryId: string, amount: number) {
    const existing = await this.repo.findOneBy({ userId, categoryId });
    if (existing) {
      existing.amount = amount;
      return this.repo.save(existing);
    }
    const budget = this.repo.create({ userId, categoryId, amount });
    return this.repo.save(budget);
  }
}
