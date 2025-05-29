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
import { LessonPlanContentService } from 'src/lesson_plan_content/lesson_plan_content.service';

@Injectable()
export class LessonService {
  constructor(
    @InjectModel(Lesson.name)
    private lessonModel: Model<Lesson>,

    private readonly lessonPlanContentService: LessonPlanContentService,

    private readonly userProgressService: UserProgressService,
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const { lesson_plan_ids, ...lessonData } = createLessonDto;

    const createdLesson = new this.lessonModel(lessonData);
    const savedLesson = await createdLesson.save();

    if (lesson_plan_ids && lesson_plan_ids.length > 0) {
      await Promise.all(
        lesson_plan_ids.map((planId) =>
          this.lessonPlanContentService.create({
            lesson_plan_id: planId,
            content_id: String(savedLesson._id),
            content_type: 'lesson',
          }),
        ),
      );
    }
    return createdLesson.save();
  }

  async findAll(): Promise<Lesson[]> {
    return this.lessonModel.find().exec();
  }

  async findAllByLessonPlan(lesson_plan_id: string): Promise<Lesson[]> {
    const contentIds =
      await this.lessonPlanContentService.getContentIdsByLessonPlan(
        lesson_plan_id,
      );

    if (contentIds.length === 0) {
      return [];
    }

    const lessons = await this.lessonModel
      .find({ _id: { $in: contentIds } })
      .exec();

    return lessons;
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
    lesson_id: string,
  ): Promise<any> {
    const lesson = await this.lessonModel.findById(lesson_id);
    if (!lesson) throw new NotFoundException('Aula não encontrada');

    const contentAssignment =
      await this.lessonPlanContentService.findOneByContent(lesson.id, 'lesson');

    if (!contentAssignment) {
      throw new NotFoundException(
        'Associação do exercício com plano de aula não encontrada',
      );
    }
    const createUserProgressDto: CreateUserProgressDto = {
      user_id: userPayload.id,
      lesson_plan_id: contentAssignment.lesson_plan_id,
      external_id: lesson_id,
      type: 'LESSON',
      points: 100,
    };

    const userProgress = await this.userProgressService.create(
      createUserProgressDto,
    );

    // await axios.post(
    //   'http://localhost:3003/user-character/complete-activity',
    //   userProgress,
    // );

    return userProgress;
  }
}
