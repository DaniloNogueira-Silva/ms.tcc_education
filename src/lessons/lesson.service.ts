import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from './lesson.schema';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UserPayload } from '../auth/auth.service';
import { UserProgressService } from '../user_progress/user_progress.service';
import { CreateUserProgressDto } from '../user_progress/dto/create-user_progress.dto';
import axios from 'axios';

@Injectable()
export class LessonService {
  constructor(
    @InjectModel(Lesson.name)
    private lessonModel: Model<Lesson>,

    private readonly userProgressService: UserProgressService,
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const createdLesson = new this.lessonModel(createLessonDto);
    return createdLesson.save();
  }

  async findAll(): Promise<Lesson[]> {
    return this.lessonModel.find().exec();
  }

  async findAllByLessonPlan(lessonPlanId: string): Promise<Lesson[]> {
    return this.lessonModel.find({ lesson_plan_id: lessonPlanId }).exec();
  }

  async findOne(id: string): Promise<Lesson> {
    const Lessons = await this.lessonModel.findById(id);
    if (!Lessons) throw new NotFoundException('Aula não encontrado');
    return Lessons;
  }

  async update(
    id: string,
    updateLessonDto: UpdateLessonDto,
  ): Promise<Lesson | null> {
    return this.lessonModel.findByIdAndUpdate(id, updateLessonDto, {
      new: true,
    });
  }

  async remove(id: string): Promise<void> {
    await this.lessonModel.findByIdAndDelete(id);
  }

  async getByUserRole(userPayload: UserPayload): Promise<any> {
    const userRole = userPayload.role;

    if (userRole === 'TEACHER') {
      const lessons = await this.lessonModel
        .find({
          teacher_id: userPayload.id,
        })
        .exec();

      return lessons;
    }
  }

  async markLessonAsCompleted(
    userPayload: UserPayload,
    id: string,
  ): Promise<any> {
    const lesson = await this.lessonModel.findById(id);
    if (!lesson) throw new NotFoundException('Aula não encontrada');

    const createUserProgressDto: CreateUserProgressDto = {
      user_id: userPayload.id,
      lesson_plan_id: lesson.lesson_plan_id,
      external_id: lesson.id,
      type: 'LESSON',
      points: 100,
    };

    const userProgress = await this.userProgressService.create(
      createUserProgressDto,
    );

    await axios.post(
      'http://localhost:3003/user-character/complete-activity',
      userProgress,
    );

    return userProgress;
  }
}
