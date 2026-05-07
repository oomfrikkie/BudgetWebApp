import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Transaction } from './transaction.entity';
import { Budget } from './budget.entity';

@Entity('categories')
export class Category {
  @PrimaryColumn({ length: 64 })
  id: string;

  @Column({ length: 128 })
  label: string;

  @Column({ length: 16 })
  emoji: string;

  @Column({ length: 32 })
  color: string;

  @OneToMany(() => Transaction, (t) => t.category)
  transactions: Transaction[];

  @OneToMany(() => Budget, (b) => b.category)
  budgets: Budget[];
}
