import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { FilterTaskDto, TaskDto, UpdateStatusTaskDto } from './dto/task.dto';
import { Task } from './task.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/user.decorator';
import { User } from '../auth/user.entity';

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
  private logger = new Logger('TasksController');

  constructor(private tasksService: TasksService) {}

  @Get()
  getTasks(
    @Query() query: FilterTaskDto,
    @GetUser() user: User,
  ): Promise<Task[]> {
    this.logger.verbose(
      `User "${user.username}" retrieving all tasks, Filters: ${JSON.stringify(query)}`,
    );
    return this.tasksService.getTasks(query, user);
  }

  @Get('/:id')
  getTaskDetail(@Param('id') id: string, @GetUser() user: User): Promise<Task> {
    this.logger.verbose(
      `User "${user.username}" retrieving task , taskId: ${id}`,
    );
    return this.tasksService.getTaskDetail(id, user);
  }

  @Post()
  createTask(@Body() task: TaskDto, @GetUser() user: User): Promise<Task> {
    this.logger.verbose(
      `User "${user.username}" creating tasks, Data: ${JSON.stringify(task)}`,
    );
    return this.tasksService.createTask(task, user);
  }

  @Delete('/:id')
  deleteTask(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.tasksService.deleteTask(id, user);
  }

  @Patch('/:id/status')
  updateStatusTask(
    @Param('id') id: string,
    @Body() statusDto: UpdateStatusTaskDto,
    @GetUser() user: User,
  ): Promise<Task> {
    return this.tasksService.updateStatusTask(id, statusDto, user);
  }
}
