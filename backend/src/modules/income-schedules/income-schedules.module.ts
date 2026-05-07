import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeSchedule } from '../../entities/income-schedule.entity';
import { IncomeSchedulesController } from './income-schedules.controller';
import { IncomeSchedulesService } from './income-schedules.service';

@Module({
  imports: [TypeOrmModule.forFeature([IncomeSchedule])],
  controllers: [IncomeSchedulesController],
  providers: [IncomeSchedulesService],
  exports: [IncomeSchedulesService],
})
export class IncomeSchedulesModule {}
