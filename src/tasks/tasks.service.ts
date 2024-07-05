import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilterTaskDto, TaskDto, UpdateStatusTaskDto } from './dto/task.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksService {
  private logger = new Logger('TasksService');

  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async getTasks(filterDto: FilterTaskDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.taskRepository
      .createQueryBuilder('task')
      .where({ user });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (error) {
      this.logger.verbose(
        `Failed to get Tasks for user ${user.username}, Filter: ${JSON.stringify(filterDto)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async getTaskDetail(id: string, user: User): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id, user } });
    if (!task) {
      throw new NotFoundException(`Task with id (${id}) not found`);
    }

    return task;
  }

  async createTask(taskDto: TaskDto, user: User): Promise<Task> {
    const { title, description } = taskDto;

    const newTask = this.taskRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });

    await this.taskRepository.save(newTask);

    return newTask;
  }

  async deleteTask(id: string, user: User): Promise<void> {
    const res = await this.taskRepository.delete({ id, user });
    if (res.affected === 0) {
      throw new NotFoundException(`Task with id (${id}) not found`);
    }
  }

  async updateStatusTask(
    id: string,
    statusDto: UpdateStatusTaskDto,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskDetail(id, user);

    task.status = statusDto.status;
    await this.taskRepository.save(task);

    return task;
  }
}
