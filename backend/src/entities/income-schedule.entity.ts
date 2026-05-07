import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

const numericTransformer = {
  to: (v: number) => v,
  from: (v: string) => (v == null ? 0 : parseFloat(v)),
};

@Entity('income_schedules')
export class IncomeSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 255 })
  label: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, transformer: numericTransformer })
  amount: number;

  @Column({ name: 'day_of_month', type: 'int' })
  dayOfMonth: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
