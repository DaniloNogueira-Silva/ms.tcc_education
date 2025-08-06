import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.schema';
import { UserPayload } from '../auth/auth.service';
import { LessonPlan } from '../lesson_plan/lesson_plan.schema';
import { Exercise } from '../exercise/exercise.schema';
import { UserProgress } from 'src/user_progress/user_progress.schema';
import { Lesson } from 'src/lessons/lesson.schema';
import { HttpRequest } from 'src/utils/http.request';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  public constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(LessonPlan.name)
    private lessonplanModel: Model<LessonPlan>,
    @InjectModel(Lesson.name)
    private lessonModel: Model<Lesson>,
    @InjectModel(Exercise.name)
    private exerciseModel: Model<Exercise>,
    @InjectModel(UserProgress.name)
    private userProgressModel: Model<UserProgress>,
    private readonly httpService: HttpRequest,
  ) {}

  public async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(
      `Attempting to create user with DTO: ${JSON.stringify(createUserDto)}`,
    );
    let newUser: User | null = null;
    try {
      const createdUser = new this.userModel(createUserDto);
      newUser = await createdUser.save();

      const data = {
        user_id: newUser.id,
        name: newUser.name,
        level: 1,
        points: 0,
        rank: 'BRONZE',
        trophies: [],
        avatar_id: '',
        coins: 0,
      };

      await this.httpService.createCharacter(data);

      return newUser;
    } catch (error) {
      if (newUser) {
        this.logger.error(
          `External service call failed for new user ${newUser.id}. Rolling back user creation.`,
        );
        await this.userModel.findByIdAndDelete(newUser.id);
      }
      this.logger.error(
        'Failed to create user or its associated character.',
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred during user creation.',
      );
    }
  }

  public async findAll(): Promise<User[]> {
    this.logger.log('Finding all users.');
    try {
      return this.userModel.find().exec();
    } catch (error) {
      this.logger.error('Failed to find all users.', error.stack);
      throw new InternalServerErrorException(
        'A failure occurred while retrieving users.',
      );
    }
  }

  public async findOne(id: string): Promise<User> {
    this.logger.log(`Finding user with ID: ${id}`);
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException(`User with ID "${id}" not found.`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to find user with ID: ${id}`, error.stack);
      throw new InternalServerErrorException(
        'A failure occurred while retrieving the user.',
      );
    }
  }

  public async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    this.logger.log(`Updating user with ID: ${id}`);
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        updateUserDto,
        { new: true },
      );
      if (!updatedUser) {
        throw new NotFoundException(
          `User with ID "${id}" not found to update.`,
        );
      }
      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update user with ID: ${id}`, error.stack);
      throw new InternalServerErrorException(
        'A failure occurred while updating the user.',
      );
    }
  }

  public async remove(id: string): Promise<void> {
    this.logger.log(`Removing user with ID: ${id}`);
    try {
      const result = await this.userModel.findByIdAndDelete(id);
      if (!result) {
        throw new NotFoundException(
          `User with ID "${id}" not found to remove.`,
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to remove user with ID: ${id}`, error.stack);
      throw new InternalServerErrorException(
        'A failure occurred while removing the user.',
      );
    }
  }

  public async getByUserRole(userPayload: UserPayload): Promise<any> {
    this.logger.log(`Getting user by role for user ID: ${userPayload.id}`);
    try {
      const userRole = userPayload.role;
      if (userRole === 'STUDENT' || userRole === 'TEACHER') {
        return await this.userModel.findById(userPayload.id).exec();
      }
    } catch (error) {
      this.logger.error(
        `Failed to get user by role for user ID: ${userPayload.id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving user data.',
      );
    }
  }

  public async getStats(userPayload: UserPayload): Promise<any> {
    this.logger.log(
      `Getting stats for user ID: ${userPayload.id} with role: ${userPayload.role}`,
    );
    try {
      const userRole = userPayload.role;
      if (userRole === 'TEACHER') {
        const user = await this.userModel.findById(userPayload.id).exec();
        const lessonplans = await this.lessonplanModel
          .find({ teacher_id: userPayload.id })
          .exec();
        const lessons = await this.lessonModel
          .find({ teacher_id: userPayload.id })
          .exec();
        const exercises = await this.exerciseModel
          .find({ teacher_id: userPayload.id })
          .exec();
        const getUserCharacterStats = await this.httpService.getStats(
          userPayload.id,
        );

        return {
          user,
          lesson_plans_length: lessonplans.length,
          lessons_length: lessons.length,
          exercises_length: exercises.length,
          ...getUserCharacterStats.data,
        };
      }

      if (userRole === 'STUDENT') {
        const user = await this.userModel.findById(userPayload.id).exec();
        const userProgress = await this.userProgressModel
          .find({ user_id: userPayload.id })
          .exec();
        const lessons = userProgress.filter(
          (progress) => progress.type === 'LESSON',
        );
        const exercises = userProgress.filter(
          (progress) => progress.type === 'EXERCISE',
        );
        const lessonplans = userProgress.map(
          (progress) => progress.lesson_plan_id,
        );

        const getUserCharacterStats = await this.httpService.getStats(
          userPayload.id,
        );

        return {
          user,
          lesson_plans_length: lessonplans.length,
          lessons_length: lessons.length,
          exercises_length: exercises.length,
          ...getUserCharacterStats.data,
        };
      }
    } catch (error) {
      this.logger.error(
        `Failed to get stats for user ID: ${userPayload.id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving user stats.',
      );
    }
  }
}
