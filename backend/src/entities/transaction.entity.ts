import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

const numericTransformer = {
  to: (v: number) => v,
  from: (v: string) => (v == null ? 0 : parseFloat(v)),
};

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ name: 'category_id', length: 64, nullable: true })
  categoryId: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2, transformer: numericTransformer })
  amount: number;

  @Column({ length: 500, default: '' })
  description: string;

  @Column({ type: 'date' })
  date: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (u) => u.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Category, (c) => c.transactions, { nullable: true, onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;
}
