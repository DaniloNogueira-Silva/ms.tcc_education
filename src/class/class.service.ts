import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateClassDto } from './dto/update-class.dto';
import { Class } from './class.schema';
import { CreateClassDto } from './dto/create-class.dto';
import { UserPayload } from 'src/auth/auth.service';
import { UserMapProgress } from 'src/user_map_progress/user_map_progress.schema';

@Injectable()
export class ClassService {
  constructor(
    @InjectModel(Class.name)
    private ClassModel: Model<Class>,

    @InjectModel(UserMapProgress.name)
    private userMapProgressModel: Model<UserMapProgress>,
  ) {}

  async create(createClassDto: CreateClassDto): Promise<Class> {
    const createdClass = new this.ClassModel(createClassDto);
    return createdClass.save();
  }

  async findAll(): Promise<Class[]> {
    return this.ClassModel.find().exec();
  }

  async findOne(id: string): Promise<Class> {
    const Class = await this.ClassModel.findById(id);
    if (!Class) throw new NotFoundException('Usuário não encontrado');
    return Class;
  }

  async update(
    id: string,
    updateClassDto: UpdateClassDto,
  ): Promise<Class | null> {
    return this.ClassModel.findByIdAndUpdate(id, updateClassDto, {
      new: true,
    });
  }

  async remove(id: string): Promise<void> {
    await this.ClassModel.findByIdAndDelete(id);
  }

  async getByUserRole(userPayload: UserPayload): Promise<any> {
    const ClassRole = userPayload.role;

    if (ClassRole === 'TEACHER') {
      const Classes = await this.ClassModel.find({
        teacher_id: userPayload.id,
      }).exec();

      return Classes;
    }

    if (ClassRole === 'STUDENT') {
      const userMapProgress = await this.userMapProgressModel.find({
        student_id: userPayload.id,
      });

      const Classes: any[] = [];
      for (const userMap of userMapProgress) {
        const Class = await this.ClassModel.findById(
          userMap.lesson_plan_id,
        ).exec();

        Classes.push(Class);
      }

      return Classes;
    }
  }
}
