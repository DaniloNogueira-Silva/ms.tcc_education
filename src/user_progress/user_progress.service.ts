import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateUserProgressDto } from './dto/update-user_progress.dto';
import { CreateUserProgressDto } from './dto/create-user_progress.dto';
import { UserPayload } from '../auth/auth.service';
import { UserProgress } from '../user_progress/user_progress.schema';
import { User } from 'src/user/user.schema';
import { UserRankingInfo } from './interfaces/user-points.interface';

@Injectable()
export class UserProgressService {
  private readonly logger = new Logger(UserProgressService.name);

  public constructor(
    @InjectModel(UserProgress.name)
    private userProgressModel: Model<UserProgress>,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  public async create(
    createUserProgressDto: CreateUserProgressDto,
  ): Promise<UserProgress> {
    this.logger.log(
      `Creating user progress with DTO: ${JSON.stringify(createUserProgressDto)}`,
    );
    try {
      const createdUserProgress = new this.userProgressModel({
        ...createUserProgressDto,
      });
      return await createdUserProgress.save();
    } catch (error) {
      this.logger.error(`Failed to create user progress.`, error.stack);
      throw new InternalServerErrorException(
        'A failure occurred while creating the user progress.',
      );
    }
  }

  public async findAll(): Promise<UserProgress[]> {
    this.logger.log('Finding all user progresses.');
    try {
      return this.userProgressModel.find().exec();
    } catch (error) {
      this.logger.error('Failed to find all user progresses.', error.stack);
      throw new InternalServerErrorException(
        'A failure occurred while retrieving user progresses.',
      );
    }
  }

  public async findAllStudentsByExerciseId(
    exerciseId: string,
  ): Promise<UserProgress[]> {
    this.logger.log(`Finding all students by exercise ID: ${exerciseId}`);
    try {
      return this.userProgressModel
        .find({ external_id: exerciseId })
        .populate('user_id', 'name')
        .exec();
    } catch (error) {
      this.logger.error(
        `Failed to find students by exercise ID: ${exerciseId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving data.',
      );
    }
  }

  public async findAllStudentsByExerciseListId(
    exercise_list_id: string,
  ): Promise<User[]> {
    this.logger.log(
      `Finding all students by exercise list ID: ${exercise_list_id}`,
    );
    try {
      const userIds = await this.userProgressModel.distinct('user_id', {
        external_id: exercise_list_id,
        type: 'EXERCISE_LIST',
      });
      return this.userModel.find({ _id: { $in: userIds } }, { name: 1 }).exec();
    } catch (error) {
      this.logger.error(
        `Failed to find students by exercise list ID: ${exercise_list_id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving data.',
      );
    }
  }

  public async findStudentsAnswersByExerciseListId(
    exercise_list_id: string,
  ): Promise<UserProgress[]> {
    this.logger.log(
      `Finding student answers by exercise list ID: ${exercise_list_id}`,
    );
    try {
      return this.userProgressModel
        .find({ external_id: exercise_list_id, type: 'EXERCISE_LIST' })
        .populate('user_id', 'name')
        .exec();
    } catch (error) {
      this.logger.error(
        `Failed to find student answers by exercise list ID: ${exercise_list_id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving data.',
      );
    }
  }

  public async findAllStudentsByLessonPlanId(
    lesson_plan_id: string,
  ): Promise<User[]> {
    this.logger.log(
      `Finding all students by lesson plan ID: ${lesson_plan_id}`,
    );
    try {
      const userIds = await this.userProgressModel.distinct('user_id', {
        lesson_plan_id,
      });
      return this.userModel.find({ _id: { $in: userIds } }, { name: 1 }).exec();
    } catch (error) {
      this.logger.error(
        `Failed to find students by lesson plan ID: ${lesson_plan_id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving data.',
      );
    }
  }

  public async findOne(id: string): Promise<UserProgress> {
    this.logger.log(`Finding user progress with ID: ${id}`);
    try {
      const userProgress = await this.userProgressModel.findById(id).exec();
      if (!userProgress) {
        throw new NotFoundException(`User progress with ID "${id}" not found.`);
      }
      return userProgress;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find user progress with ID: ${id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving the user progress.',
      );
    }
  }

  public async update(
    id: string,
    updateUserProgressDto: UpdateUserProgressDto,
  ): Promise<UserProgress | null> {
    this.logger.log(`Updating user progress with ID: ${id}`);
    try {
      const updatedProgress = await this.userProgressModel.findByIdAndUpdate(
        id,
        updateUserProgressDto,
        {
          new: true,
        },
      );
      if (!updatedProgress) {
        throw new NotFoundException(
          `User progress with ID "${id}" not found to update.`,
        );
      }
      return updatedProgress;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to update user progress with ID: ${id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while updating the user progress.',
      );
    }
  }

  public async remove(id: string): Promise<void> {
    this.logger.log(`Removing user progress with ID: ${id}`);
    try {
      const result = await this.userProgressModel.findByIdAndDelete(id);
      if (!result) {
        throw new NotFoundException(
          `User progress with ID "${id}" not found to remove.`,
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to remove user progress with ID: ${id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while removing the user progress.',
      );
    }
  }

  public async getByUserRole(userPayload: UserPayload): Promise<any> {
    this.logger.log(
      `Getting progress for user ID: ${userPayload.id} with role: ${userPayload.role}`,
    );
    try {
      if (userPayload.role === 'TEACHER') {
        return await this.userProgressModel
          .find({ user_id: userPayload.id })
          .exec();
      }

      if (userPayload.role === 'STUDENT') {
        return await this.userProgressModel
          .find({ user_id: userPayload.id })
          .exec();
      }
    } catch (error) {
      this.logger.error(
        `Failed to get progress for user ID: ${userPayload.id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving user progress.',
      );
    }
  }

  public async findOneByExerciseAndUser(
    externalId: string,
    userId: string,
  ): Promise<UserProgress> {
    this.logger.log(
      `Finding progress by exercise ${externalId} and user ${userId}`,
    );
    try {
      const userProgress = await this.userProgressModel
        .findOne({ external_id: externalId, user_id: userId })
        .exec();

      if (!userProgress) {
        throw new NotFoundException(
          'User progress not found for this exercise and user.',
        );
      }
      return userProgress;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find progress for exercise ${externalId} and user ${userId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving data.',
      );
    }
  }

  public async hasCompletedExercise(
    external_id: string,
    user_id: string,
  ): Promise<boolean> {
    this.logger.log(
      `Checking if user ${user_id} has completed exercise ${external_id}`,
    );
    try {
      const result = await this.userProgressModel
        .findOne({ external_id, user_id })
        .exec();

      return !!result;
    } catch (error) {
      this.logger.error(
        `Failed to check completion for user ${user_id} and exercise ${external_id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred during the check.',
      );
    }
  }

  public async findByLessonPlanAndType(
    externalId: string,
    type: string,
  ): Promise<UserProgress[]> {
    this.logger.log(
      `Finding progress by lesson plan ${externalId} and type ${type}`,
    );
    try {
      const userProgress = await this.userProgressModel
        .find({
          type,
          external_id: externalId,
        })
        .exec();

      const userIds = userProgress.map((up) => up.user_id);
      const users = await this.userModel.find({ _id: { $in: userIds } }).exec();

      return userProgress.map((up) => ({
        ...up.toJSON(),
        user: users.find((user) => user.id === up.user_id),
      }));
    } catch (error) {
      this.logger.error(
        `Failed to find by lesson plan ${externalId} and type ${type}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving data.',
      );
    }
  }

  public async findTotalPointsByUser(
    lessonPlanId: string,
  ): Promise<UserRankingInfo[]> {
    this.logger.log(
      `Finding total points by user for lesson plan ID: ${lessonPlanId}`,
    );
    try {
      const rankingData = await this.userProgressModel.aggregate([
        {
          $match: {
            lesson_plan_id: lessonPlanId,
          },
        },
        {
          $group: {
            _id: '$user_id',
            totalPoints: { $sum: '$points' },
          },
        },
        {
          $addFields: {
            userObjectId: { $toObjectId: '$_id' },
          },
        },
        {
          $sort: { totalPoints: -1 },
        },
        {
          $lookup: {
            from: 'user',
            localField: 'userObjectId',
            foreignField: '_id',
            as: 'userInfo',
          },
        },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            totalPoints: '$totalPoints',
            name: {
              $ifNull: [{ $first: '$userInfo.name' }, 'Usuário Desconhecido'],
            },
          },
        },
      ]);
      return rankingData;
    } catch (error) {
      this.logger.error(
        `Failed to find total points for lesson plan ID: ${lessonPlanId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while calculating points.',
      );
    }
  }
}
