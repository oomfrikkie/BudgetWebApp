import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { Budget } from './budget.entity';
import { SavingsGoal } from './savings-goal.entity';

const numericTransformer = {
  to: (v: number) => v,
  from: (v: string) => (v == null ? 0 : parseFloat(v)),
};

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', length: 255, default: '' })
  passwordHash: string;

  @Column({ name: 'estimated_salary', type: 'numeric', precision: 10, scale: 2, default: 0, transformer: numericTransformer })
  estimatedSalary: number;

  @Column({ name: 'hourly_rate', type: 'numeric', precision: 10, scale: 2, default: 0, transformer: numericTransformer })
  hourlyRate: number;

  @Column({ name: 'hours_per_week', type: 'int', default: 0 })
  hoursPerWeek: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Transaction, (t) => t.user)
  transactions: Transaction[];

  @OneToMany(() => Budget, (b) => b.user)
  budgets: Budget[];

  @OneToMany(() => SavingsGoal, (g) => g.user)
  savingsGoals: SavingsGoal[];
}
