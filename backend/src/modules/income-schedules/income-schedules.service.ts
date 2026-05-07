import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncomeSchedule } from '../../entities/income-schedule.entity';
import { CreateIncomeScheduleDto } from './dto/create-income-schedule.dto';
import { UpdateIncomeScheduleDto } from './dto/update-income-schedule.dto';

@Injectable()
export class IncomeSchedulesService {
  constructor(
    @InjectRepository(IncomeSchedule)
    private readonly repo: Repository<IncomeSchedule>,
  ) {}

  findAll(userId?: string) {
    const where: any = { active: true };
    if (userId) where.userId = userId;
    return this.repo.find({ where, order: { dayOfMonth: 'ASC' } });
  }

  async findOne(id: number) {
    const schedule = await this.repo.findOneBy({ id });
    if (!schedule) throw new NotFoundException(`Income schedule ${id} not found`);
    return schedule;
  }

  create(dto: CreateIncomeScheduleDto) {
    const schedule = this.repo.create(dto);
    return this.repo.save(schedule);
  }

  async update(id: number, dto: UpdateIncomeScheduleDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const schedule = await this.findOne(id);
    return this.repo.remove(schedule);
  }
}
