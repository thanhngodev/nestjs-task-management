import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../task-status.enum';

export class TaskDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
}

export class FilterTaskDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  search?: string;
}

export class UpdateStatusTaskDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
