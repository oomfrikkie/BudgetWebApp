import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavingsGoal } from '../../entities/savings-goal.entity';

@Injectable()
export class SavingsGoalsService {
  constructor(@InjectRepository(SavingsGoal) private readonly repo: Repository<SavingsGoal>) {}
}
