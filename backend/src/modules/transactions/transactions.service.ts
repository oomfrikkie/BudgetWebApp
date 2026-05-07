import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(@InjectRepository(Transaction) private readonly repo: Repository<Transaction>) {}

  findAll(userId?: string) {
    const where = userId ? { userId } : {};
    return this.repo.find({ where, relations: ['category'], order: { date: 'DESC' } });
  }

  async findOne(id: string) {
    const tx = await this.repo.findOne({ where: { id }, relations: ['category'] });
    if (!tx) throw new NotFoundException(`Transaction ${id} not found`);
    return tx;
  }

  create(dto: CreateTransactionDto) {
    const tx = this.repo.create(dto);
    return this.repo.save(tx);
  }

  async update(id: string, dto: UpdateTransactionDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const tx = await this.findOne(id);
    return this.repo.remove(tx);
  }
}
