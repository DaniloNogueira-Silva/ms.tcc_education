import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateClassDto } from './dto/update-class.dto';
import { Class } from './class.schema';
import { CreateClassDto } from './dto/create-class.dto';
import { UserPayload } from 'src/auth/auth.service';

@Injectable()
export class ClassService {
  constructor(
    @InjectModel(Class.name)
    private classModel: Model<Class>,
  ) {}

  async create(createClassDto: CreateClassDto): Promise<Class> {
    const createdClass = new this.classModel(createClassDto);
    return createdClass.save();
  }

  async findAll(): Promise<Class[]> {
    return this.classModel.find().exec();
  }

  async findOne(id: string): Promise<Class> {
    const Class = await this.classModel.findById(id);
    if (!Class) throw new NotFoundException('Aula não encontrado');
    return Class;
  }

  async update(
    id: string,
    updateClassDto: UpdateClassDto,
  ): Promise<Class | null> {
    return this.classModel.findByIdAndUpdate(id, updateClassDto, {
      new: true,
    });
  }

  async remove(id: string): Promise<void> {
    await this.classModel.findByIdAndDelete(id);
  }

  async getByUserRole(userPayload: UserPayload): Promise<any> {
    const userRole = userPayload.role;

    if (userRole === 'TEACHER') {
      const classes = await this.classModel
        .find({
          teacher_id: userPayload.id,
        })
        .exec();

      return classes;
    }
  }
}
