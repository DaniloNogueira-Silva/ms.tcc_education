import { Injectable, NotFoundException } from '@nestjs/common';
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
  constructor(
    @InjectModel(UserProgress.name)
    private userProgressModel: Model<UserProgress>,

    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async create(
    createUserProgressDto: CreateUserProgressDto,
  ): Promise<UserProgress> {
    const createdUserProgress = new this.userProgressModel({
      ...createUserProgressDto,
    });
    return createdUserProgress.save();
  }

  async findAll(): Promise<UserProgress[]> {
    return this.userProgressModel.find().exec();
  }

  async findAllStudentsByExerciseId(
    exerciseId: string,
  ): Promise<UserProgress[]> {
    return this.userProgressModel
      .find({ external_id: exerciseId })
      .populate('user_id', 'name')
      .exec();
  }

  async findAllStudentsByExerciseListId(
    exercise_list_id: string,
  ): Promise<User[]> {
    const userIds = await this.userProgressModel.distinct('user_id', {
      external_id: exercise_list_id,
      type: 'EXERCISE_LIST',
    });

    return this.userModel.find({ _id: { $in: userIds } }, { name: 1 }).exec();
  }

  async findStudentsAnswersByExerciseListId(
    exercise_list_id: string,
  ): Promise<UserProgress[]> {
    return this.userProgressModel
      .find({ external_id: exercise_list_id, type: 'EXERCISE_LIST' })
      .populate('user_id', 'name')
      .exec();
  }

  async findAllStudentsByLessonPlanId(lesson_plan_id: string): Promise<User[]> {
    const userIds = await this.userProgressModel.distinct('user_id', {
      lesson_plan_id,
    });
    return this.userModel.find({ _id: { $in: userIds } }, { name: 1 }).exec();
  }

  async findOne(id: string): Promise<UserProgress> {
    const userProgress = await this.userProgressModel.findById(id);
    if (!userProgress)
      throw new NotFoundException('Progress do usuário não encontrado');
    return userProgress;
  }

  async update(
    id: string,
    updateUserProgressDto: UpdateUserProgressDto,
  ): Promise<UserProgress | null> {
    return this.userProgressModel.findByIdAndUpdate(id, updateUserProgressDto, {
      new: true,
    });
  }

  async remove(id: string): Promise<void> {
    await this.userProgressModel.findByIdAndDelete(id);
  }

  async getByUserRole(userPayload: UserPayload): Promise<any> {
    const userRole = userPayload.role;
    if (userRole === 'TEACHER') {
      const userProgress = await this.userProgressModel
        .find({ user_id: userPayload.id })
        .exec();
      return userProgress;
    }

    if (userRole === 'STUDENT') {
      const userProgress = await this.userProgressModel
        .find({ user_id: userPayload.id })
        .exec();

      return userProgress;
    }
  }

  async findOneByExerciseAndUser(
    externalId: string,
    userId: string,
  ): Promise<UserProgress> {
    const userProgress = await this.userProgressModel
      .findOne({ external_id: externalId, user_id: userId })
      .exec();

    if (!userProgress)
      throw new NotFoundException('Progress do usuário não encontrado');
    return userProgress;
  }

  async hasCompletedExercise(
    external_id: string,
    user_id: string,
  ): Promise<boolean> {
    const result = await this.userProgressModel
      .findOne({ external_id, user_id })
      .exec();

    return !!result;
  }

  async findByLessonPlanAndType(
    externalId: string,
    type: string,
  ): Promise<UserProgress[]> {
    const userProgress = await this.userProgressModel
      .find({
        type,
        external_id: externalId,
      })
      .exec();

    const userIds = userProgress.map((userProgress) => userProgress.user_id);
    const users = await this.userModel.find({ _id: { $in: userIds } }).exec();

    return userProgress.map((userProgress) => ({
      ...userProgress.toJSON(),
      user: users.find((user) => user.id === userProgress.user_id),
    }));
  }

  async findTotalPointsByUser(
    lessonPlanId: string,
  ): Promise<UserRankingInfo[]> {
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
  }
}
