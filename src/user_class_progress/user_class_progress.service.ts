import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateUserClassProgressDto } from './dto/update-user_class_progress.dto';
import { UserClassProgress } from './user_class_progress.schema';
import { CreateUserClassProgressDto } from './dto/create-user_class_progress.dto';
import { UserPayload } from 'src/auth/auth.service';
import { LessonPlan } from 'src/lesson_plan/lesson_plan.schema';
import { Class } from 'src/class/class.schema';

@Injectable()
export class UserClassProgressService {
  constructor(
    @InjectModel(UserClassProgress.name)
    private userClassProgressModel: Model<UserClassProgress>,

    @InjectModel(Class.name)
    private classModel: Model<Class>,
  ) {}

  async create(
    createUserClassProgressDto: CreateUserClassProgressDto,
  ): Promise<UserClassProgress> {
    const createdUserClassProgress = new this.userClassProgressModel(
      createUserClassProgressDto,
    );
    return createdUserClassProgress.save();
  }

  async findAll(): Promise<UserClassProgress[]> {
    return this.userClassProgressModel.find().exec();
  }

  async findOne(id: string): Promise<UserClassProgress> {
    const userclassprogress = await this.userClassProgressModel.findById(id);
    if (!userclassprogress)
      throw new NotFoundException('Usuário não encontrado');
    return userclassprogress;
  }

  async update(
    id: string,
    updateUserClassProgressDto: UpdateUserClassProgressDto,
  ): Promise<UserClassProgress | null> {
    return this.userClassProgressModel.findByIdAndUpdate(
      id,
      updateUserClassProgressDto,
      { new: true },
    );
  }

  async remove(id: string): Promise<void> {
    await this.userClassProgressModel.findByIdAndDelete(id);
  }

  async getByUserRole(userPayload: UserPayload): Promise<any> {
    const userClassProgressRole = userPayload.role;
    const userId = userPayload.id;

    if (userClassProgressRole === 'TEACHER') {
      const classes = await this.classModel.find({ teacher_id: userId }).exec();

      let usersClassProgress: any[] = [];
      for (const oneClass of classes) {
        const classUsers = await this.userClassProgressModel
          .find({ class_id: oneClass.id })
          .exec();
        usersClassProgress.push(classUsers);
      }

      return usersClassProgress;
    }

    if (userClassProgressRole === 'STUDENT') {
      return await this.userClassProgressModel
        .find({ student_id: userId })
        .exec();
    }
  }
}
