import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.schema';
import { UserPayload } from '../auth/auth.service';
import { LessonPlan } from '../lesson_plan/lesson_plan.schema';
import { Exercise } from '../exercise/exercise.schema';
import axios from 'axios';
import { UserProgress } from 'src/user_progress/user_progress.schema';
import { Lesson } from 'src/lessons/lesson.schema';

@Injectable()
export class UserService {
  constructor(
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
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    const user = await createdUser.save();

    await axios.post('http://localhost:3003/user-character/', {
      user_id: user.id,
      name: user.name,
      level: 1,
      points: 0,
      rank: 'BRONZE',
      trophies: [],
      avatar_id: '',
      coins: 0
    });

    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
  }

  async remove(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id);
  }

  async getByUserRole(userPayload: UserPayload): Promise<any> {
    const userRole = userPayload.role;

    if (userRole === 'STUDENT' || userRole === 'TEACHER') {
      return await this.userModel.findById(userPayload.id).exec();
    }
  }

  async getStats(userPayload: UserPayload): Promise<any> {
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


      const getUserCharacterStats = await axios.get(
        `http://localhost:3003/user-character/stats/${userPayload.id}`,
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
        (userProgress) => userProgress.type === 'LESSON',
      );
      const exercises = userProgress.filter(
        (userProgress) => userProgress.type === 'EXERCISE',
      );
      const lessonplans = userProgress.map(
        (userProgress) => userProgress.lesson_plan_id,
      );

      const getUserCharacterStats = await axios.get(
        `http://localhost:3003/user-character/stats/${userPayload.id}`,
      );

      return {
        user,
        lesson_plans_length: lessonplans.length,
        lessons_length: lessons.length,
        exercises_length: exercises.length,
        ...getUserCharacterStats.data,
      };
    }
  }
}
