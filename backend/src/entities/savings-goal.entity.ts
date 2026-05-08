import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

const numericTransformer = {
  to: (v: number) => v,
  from: (v: string) => (v == null ? 0 : parseFloat(v)),
};

@Entity('savings_goals')
export class SavingsGoal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'target_amount', type: 'numeric', precision: 10, scale: 2, transformer: numericTransformer })
  targetAmount: number;

  @Column({ name: 'current_amount', type: 'numeric', precision: 10, scale: 2, default: 0, transformer: numericTransformer })
  currentAmount: number;

  @ManyToOne(() => User, (u) => u.savingsGoals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
