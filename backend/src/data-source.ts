import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Category } from './entities/category.entity';
import { Transaction } from './entities/transaction.entity';
import { Budget } from './entities/budget.entity';
import { IncomeSchedule } from './entities/income-schedule.entity';
import { SavingsGoal } from './entities/savings-goal.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER || 'admin',
  password: process.env.POSTGRES_PASSWORD || 'admin',
  database: process.env.POSTGRES_DB || 'mydb',
  entities: [User, Category, Transaction, Budget, IncomeSchedule, SavingsGoal],
  migrations: ['src/migrations/*.ts'],
  ssl: { rejectUnauthorized: false },
});
