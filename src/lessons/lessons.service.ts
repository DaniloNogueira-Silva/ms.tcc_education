import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateLessonsDto } from './dto/update-lessons.dto';
import { Lessons } from './lessons.schema';
import { CreateLessonsDto } from './dto/create-lessons.dto';
import { UserPayload } from 'src/auth/auth.service';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lessons.name)
    private lessonModel: Model<Lessons>,
  ) {}

  async create(createLessonsDto: CreateLessonsDto): Promise<Lessons> {
    const createdLessons = new this.lessonModel(createLessonsDto);
    return createdLessons.save();
  }

  async findAll(): Promise<Lessons[]> {
    return this.lessonModel.find().exec();
  }

  async findOne(id: string): Promise<Lessons> {
    const Lessons = await this.lessonModel.findById(id);
    if (!Lessons) throw new NotFoundException('Aula não encontrado');
    return Lessons;
  }

  async update(
    id: string,
    updateLessonsDto: UpdateLessonsDto,
  ): Promise<Lessons | null> {
    return this.lessonModel.findByIdAndUpdate(id, updateLessonsDto, {
      new: true,
    });
  }

  async remove(id: string): Promise<void> {
    await this.lessonModel.findByIdAndDelete(id);
  }

  async getByUserRole(userPayload: UserPayload): Promise<any> {
    const userRole = userPayload.role;

    if (userRole === 'TEACHER') {
      const classes = await this.lessonModel
        .find({
          teacher_id: userPayload.id,
        })
        .exec();

      return classes;
    }
  }
}
