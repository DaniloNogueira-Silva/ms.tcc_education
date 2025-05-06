import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateLessonPlanDto } from './dto/update-lesson_plan.dto';
import { LessonPlan } from './lesson_plan.schema';
import { CreateLessonPlanDto } from './dto/create-lesson_plan.dto';
import { UserPayload } from '../auth/auth.service';
import { UserProgress } from '../user_progress/user_progress.schema';
import { UserProgressService } from '../user_progress/user_progress.service';
import { CreateUserProgressDto } from '../user_progress/dto/create-user_progress.dto';
import { User } from 'src/user/user.schema';
import { Lesson } from 'src/lessons/lesson.schema';
import {
  Exercise,
  MultipleChoiceExercise,
  TrueFalseExercise,
} from 'src/exercise/exercise.schema';
import { ExerciseList } from 'src/exercise_list/exercise_list.schema';

@Injectable()
export class LessonPlanService {
  constructor(
    @InjectModel(LessonPlan.name)
    private lessonplanModel: Model<LessonPlan>,

    private readonly userProgressService: UserProgressService,

    @InjectModel(UserProgress.name)
    private userProgressModel: Model<UserProgress>,

    @InjectModel(User.name)
    private userModel: Model<User>,

    @InjectModel(Lesson.name)
    private lessonModel: Model<Lesson>,

    @InjectModel(Exercise.name)
    private exerciseModel: Model<Exercise>,

    @InjectModel(ExerciseList.name)
    private exerciseListModel: Model<ExerciseList>,

    @InjectModel(MultipleChoiceExercise.name)
    private multipleChoiceExerciseModel: Model<MultipleChoiceExercise>,

    @InjectModel(TrueFalseExercise.name)
    private trueFalseExerciseModel: Model<TrueFalseExercise>,
  ) {}

  async create(
    createLessonPlanDto: CreateLessonPlanDto,
    userPayload: UserPayload,
  ): Promise<LessonPlan> {
    const createdLessonPlan = new this.lessonplanModel({
      ...createLessonPlanDto,
      teacher_id: userPayload.id,
    });
    return createdLessonPlan.save();
  }

  async findAll(): Promise<LessonPlan[]> {
    return this.lessonplanModel.find().exec();
  }

  async findOne(id: string): Promise<LessonPlan> {
    const lessonplan = await this.lessonplanModel.findById(id);
    if (!lessonplan)
      throw new NotFoundException('Plano de aula não encontrado');
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
      const userProgress = await this.userProgressModel
        .find({ user_id: userPayload.id })
        .exec();

      const lessonplans = await this.lessonplanModel
        .find({ _id: { $in: userProgress.map((p) => p.lesson_plan_id) } })
        .exec();

      let teste: {
        total: number;
        lessonsCompleted: number;
        teacher: User | null;
        lessonplan: LessonPlan;
      }[] = [];

      for (const lessonplan of lessonplans) {
        const teacher = await this.userModel
          .findById(lessonplan.teacher_id)
          .exec();

        const lessons = await this.lessonModel
          .find({ lesson_plan_id: lessonplan._id })
          .exec();

        const lessonTotal = lessons.length;

        const exercise = await this.exerciseModel
          .find({ lesson_plan_id: lessonplan._id })
          .exec();

        const multipleChoiceExercise = await this.multipleChoiceExerciseModel
          .find({ lesson_plan_id: lessonplan._id })
          .exec();

        const multipleChoiceExerciseTotal = multipleChoiceExercise.length;

        const trueFalseExercise = await this.trueFalseExerciseModel
          .find({ lesson_plan_id: lessonplan._id })
          .exec();

        const trueFalseExerciseTotal = trueFalseExercise.length;

        const exerciseTotal = exercise.length;

        const exerciseList = await this.exerciseListModel
          .find({ lesson_plan_id: lessonplan._id })
          .exec();

        const exerciseListTotal = exerciseList.length;

        const total =
          lessonTotal +
          exerciseTotal +
          exerciseListTotal +
          multipleChoiceExerciseTotal +
          trueFalseExerciseTotal;

        const lessonsCompleted = userProgress.map(
          (p) => p.lesson_plan_id === lessonplan._id,
        ).length;

        teste.push({ total, lessonsCompleted, teacher, lessonplan });
      }

      return teste;
    }
  }

  async inviteUser(
    createUserProgressDto: CreateUserProgressDto,
  ): Promise<UserProgress> {
    const createdUserProgress = this.userProgressService.create(
      createUserProgressDto,
    );
    return createdUserProgress;
  }
}
