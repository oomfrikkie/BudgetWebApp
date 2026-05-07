import { PartialType } from '@nestjs/mapped-types';
import { CreateIncomeScheduleDto } from './create-income-schedule.dto';

export class UpdateIncomeScheduleDto extends PartialType(CreateIncomeScheduleDto) {}
