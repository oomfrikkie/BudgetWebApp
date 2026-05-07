import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';

const numericTransformer = {
  to: (v: number) => v,
  from: (v: string) => (v == null ? 0 : parseFloat(v)),
};

@Entity('budgets')
@Unique(['userId', 'categoryId'])
export class Budget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'category_id', length: 64 })
  categoryId: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, transformer: numericTransformer })
  amount: number;

  @ManyToOne(() => User, (u) => u.budgets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Category, (c) => c.budgets, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
