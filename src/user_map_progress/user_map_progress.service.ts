import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateUserMapProgressDto } from './dto/update-user_map_progress.dto';
import { UserMapProgress } from './user_map_progress.schema';
import { CreateUserMapProgressDto } from './dto/create-user_map_progress.dto';
import { UserPayload } from 'src/auth/auth.service';
import { LessonPlan } from 'src/lesson_plan/lesson_plan.schema';

@Injectable()
export class UserMapProgressService {
  constructor(
    @InjectModel(UserMapProgress.name)
    private userMapProgressModel: Model<UserMapProgress>,

    @InjectModel(LessonPlan.name)
    private lessonPlanModel: Model<LessonPlan>,
  ) {}

  async create(
    createUserMapProgressDto: CreateUserMapProgressDto,
  ): Promise<UserMapProgress> {
    const createdUserMapProgress = new this.userMapProgressModel(
      {
        ...createUserMapProgressDto,
        score: 0,
        status: 'EM ANDAMENTO',
      }
    );
    return createdUserMapProgress.save();
  }

  async findAll(): Promise<UserMapProgress[]> {
    return this.userMapProgressModel.find().exec();
  }

  async findOne(id: string): Promise<UserMapProgress> {
    const usermapprogress = await this.userMapProgressModel.findById(id);
    if (!usermapprogress) throw new NotFoundException('Usuário não encontrado');
    return usermapprogress;
  }

  async update(
    id: string,
    updateUserMapProgressDto: UpdateUserMapProgressDto,
  ): Promise<UserMapProgress | null> {
    return this.userMapProgressModel.findByIdAndUpdate(
      id,
      updateUserMapProgressDto,
      { new: true },
    );
  }

  async remove(id: string): Promise<void> {
    await this.userMapProgressModel.findByIdAndDelete(id);
  }

  async getByUserRole(userPayload: UserPayload): Promise<any> {
    const userMapProgressRole = userPayload.role;
    const userId = userPayload.id;

    if (userMapProgressRole === 'TEACHER') {
      const lessonPlans = await this.lessonPlanModel
        .find({ teacher_id: userId })
        .exec();

      let usersMapProgress: any[] = [];
      for (const lessonPlan of lessonPlans) {
        const usermapprogress = await this.userMapProgressModel
          .find({ lesson_plan_id: lessonPlan.id })
          .exec();
        usersMapProgress.push(usermapprogress);
      }

      return usersMapProgress;
    }

    if (userMapProgressRole === 'STUDENT') {
      return await this.userMapProgressModel.findById(userPayload.id).exec();
    }
  }
}
