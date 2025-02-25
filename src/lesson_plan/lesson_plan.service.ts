import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateLessonPlanDto } from './dto/update-lesson_plan.dto';
import { LessonPlan } from './lesson_plan.schema';
import { CreateLessonPlanDto } from './dto/create-lesson_plan.dto';
import { UserPayload } from 'src/auth/auth.service';
import { UserMapProgress } from 'src/user_map_progress/user_map_progress.schema';

@Injectable()
export class LessonPlanService {
  constructor(
    @InjectModel(LessonPlan.name)
    private lessonplanModel: Model<LessonPlan>,

    @InjectModel(UserMapProgress.name)
    private userMapProgressModel: Model<UserMapProgress>,
  ) {}

  async create(createLessonPlanDto: CreateLessonPlanDto): Promise<LessonPlan> {
    const createdLessonPlan = new this.lessonplanModel(createLessonPlanDto);
    return createdLessonPlan.save();
  }

  async findAll(): Promise<LessonPlan[]> {
    return this.lessonplanModel.find().exec();
  }

  async findOne(id: string): Promise<LessonPlan> {
    const lessonplan = await this.lessonplanModel.findById(id);
    if (!lessonplan) throw new NotFoundException('Usuário não encontrado');
    return lessonplan;
  }

  async update(
    id: string,
    updateLessonPlanDto: UpdateLessonPlanDto,
  ): Promise<LessonPlan | null> {
    return this.lessonplanModel.findByIdAndUpdate(id, updateLessonPlanDto, {
      new: true,
    });
  }

  async remove(id: string): Promise<void> {
    await this.lessonplanModel.findByIdAndDelete(id);
  }

  async getByUserRole(userPayload: UserPayload): Promise<any> {
    const userRole = userPayload.role;

    if (userRole === 'TEACHER') {
      const lessonPlans = await this.lessonplanModel
        .find({ teacher_id: userPayload.id })
        .exec();

      return lessonPlans;
    }

    if (userRole === 'STUDENT') {
      const userMapProgress = await this.userMapProgressModel.find({
        student_id: userPayload.id,
      });

      let lessonplans: any[] = [];
      for (const userMap of userMapProgress) {
        const lessonPlan = await this.lessonplanModel
          .findById(userMap.lesson_plan_id)
          .exec();

        lessonplans.push(lessonPlan);
      }

      return lessonplans;
    }
  }
}
