import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.schema';
import { UserPayload } from 'src/auth/auth.service';
import { SchoolUser } from 'src/school_user/school_user.schema';
import { LessonPlan } from 'src/lesson_plan/lesson_plan.schema';
import { Exercise } from 'src/exercise/exercise.schema';
import { UserMapProgress } from 'src/user_map_progress/user_map_progress.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,

    @InjectModel(LessonPlan.name)
    private lessonPlanModel: Model<LessonPlan>,

    @InjectModel(Exercise.name)
    private exerciseModel: Model<Exercise>,

    @InjectModel(UserMapProgress.name)
    private userMapModel: Model<UserMapProgress>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
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

  async getStaticsByUserRole(userPayload: UserPayload): Promise<any> {

    const lessonPlans = await this.lessonPlanModel
      .find({ teacher_id: userPayload.id })
      .exec();

    console.log(lessonPlans);

    const createdExercises = await this.exerciseModel
      .find({ teacher_id: userPayload.id })
      .exec();
      console.log(createdExercises);

    let users: any[] = [];

    for (const lp of lessonPlans) {
      const userMapProgress = await this.userMapModel
        .find({ lesson_plan_id: lp.id })
        .exec();

      users.push(...userMapProgress);
    }

    return {
      maps: lessonPlans.length,
      exercises: createdExercises.length,
      students: users.length,
    };
  }
}
