import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateLessonPlanDto } from './dto/update-lesson_plan.dto';
import { LessonPlan } from './lesson_plan.schema';
import { CreateLessonPlanDto } from './dto/create-lesson_plan.dto';
import { UserPayload } from '../auth/auth.service';
import { UserProgress } from '../user_progress/user_progress.schema';
import { UserProgressService } from '../user_progress/user_progress.service';
import { CreateUserProgressDto } from '../user_progress/dto/create-user_progress.dto';
import { User } from '../user/user.schema';
import { Lesson } from '../lessons/lesson.schema';
import { Exercise } from '../exercise/exercise.schema';
import { ExerciseList } from '../exercise_list/exercise_list.schema';

@Injectable()
export class LessonPlanService {
  private readonly logger = new Logger(LessonPlanService.name);

  public constructor(
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
  ) {}

  public async create(
    createLessonPlanDto: CreateLessonPlanDto,
    userPayload: UserPayload,
  ): Promise<LessonPlan> {
    this.logger.log(
      `User ${userPayload.id} is creating a lesson plan with name: "${createLessonPlanDto.name}"`,
    );
    try {
      const createdLessonPlan = new this.lessonplanModel({
        ...createLessonPlanDto,
        teacher_id: userPayload.id,
      });
      return await createdLessonPlan.save();
    } catch (error) {
      this.logger.error('Failed to create lesson plan.', error.stack);
      throw new InternalServerErrorException(
        'A failure occurred during lesson plan creation.',
      );
    }
  }

  public async findAll(): Promise<LessonPlan[]> {
    this.logger.log('Finding all lesson plans.');
    try {
      return this.lessonplanModel.find().exec();
    } catch (error) {
      this.logger.error('Failed to find all lesson plans.', error.stack);
      throw new InternalServerErrorException(
        'A failure occurred while retrieving lesson plans.',
      );
    }
  }

  public async findOne(id: string): Promise<LessonPlan> {
    this.logger.log(`Finding lesson plan with ID: ${id}`);
    try {
      const lessonplan = await this.lessonplanModel.findById(id).exec();
      if (!lessonplan) {
        throw new NotFoundException(`Lesson plan with ID "${id}" not found.`);
      }
      return lessonplan;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find lesson plan with ID: ${id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving the lesson plan.',
      );
    }
  }

  public async update(
    id: string,
    updateLessonPlanDto: UpdateLessonPlanDto,
  ): Promise<LessonPlan | null> {
    this.logger.log(`Updating lesson plan with ID: ${id}`);
    try {
      const updatedLessonPlan = await this.lessonplanModel.findByIdAndUpdate(
        id,
        updateLessonPlanDto,
        { new: true },
      );
      if (!updatedLessonPlan) {
        throw new NotFoundException(
          `Lesson plan with ID "${id}" not found to update.`,
        );
      }
      return updatedLessonPlan;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to update lesson plan with ID: ${id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while updating the lesson plan.',
      );
    }
  }

  public async remove(id: string): Promise<void> {
    this.logger.log(`Removing lesson plan with ID: ${id}`);
    try {
      const result = await this.lessonplanModel.findByIdAndDelete(id);
      if (!result) {
        throw new NotFoundException(
          `Lesson plan with ID "${id}" not found to remove.`,
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to remove lesson plan with ID: ${id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while removing the lesson plan.',
      );
    }
  }

  public async getByUserRole(userPayload: UserPayload): Promise<any> {
    this.logger.log(
      `Getting lesson plans for user ID: ${userPayload.id} with role: ${userPayload.role}`,
    );
    try {
      const userRole = userPayload.role;

      if (userRole === 'TEACHER') {
        const lessonplans = await this.lessonplanModel
          .find({ teacher_id: userPayload.id })
          .exec();
        const results: {
          progress: number;
          teacher: User | null;
          lessonplan: LessonPlan;
        }[] = [];
        for (const lessonplan of lessonplans) {
          const teacher = await this.userModel
            .findById(lessonplan.teacher_id)
            .exec();
          results.push({ teacher, lessonplan, progress: 100 });
        }
        return results;
      }

      if (userRole === 'STUDENT') {
        const userProgress = await this.userProgressModel
          .find({ user_id: userPayload.id })
          .exec();
        const lessonplanIds = userProgress.map((p) => p.lesson_plan_id);
        const lessonplans = await this.lessonplanModel
          .find({ _id: { $in: lessonplanIds } })
          .exec();
        const results: {
          progress: number;
          teacher: User | null;
          lessonplan: LessonPlan;
        }[] = [];

        for (const lessonplan of lessonplans) {
          const teacher = await this.userModel
            .findById(lessonplan.teacher_id)
            .exec();
          const lessons = await this.lessonModel
            .find({ 'lesson_plan_content.lesson_plan_id': lessonplan._id })
            .exec();
          const lessonTotal = lessons.length;
          const exercises = await this.exerciseModel
            .find({ 'lesson_plan_content.lesson_plan_id': lessonplan._id })
            .exec();
          const exerciseTotal = exercises.length;
          const exerciseLists = await this.exerciseListModel
            .find({ 'lesson_plan_content.lesson_plan_id': lessonplan._id })
            .exec();
          const exerciseListTotal = exerciseLists.length;
          const total = lessonTotal + exerciseTotal + exerciseListTotal;
          const completedCount = userProgress.filter(
            (p) => String(p.lesson_plan_id) === String(lessonplan._id),
          ).length;
          const progress =
            total > 0
              ? Math.min(Math.round((completedCount / total) * 100), 100)
              : 0;
          results.push({ teacher, lessonplan, progress });
        }
        return results;
      }
    } catch (error) {
      this.logger.error(
        `Failed to get lesson plans for user ID: ${userPayload.id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving lesson plan data.',
      );
    }
  }

  public async inviteUser(
    createUserProgressDto: CreateUserProgressDto,
  ): Promise<UserProgress> {
    this.logger.log(
      `Inviting user ${createUserProgressDto.user_id} to lesson plan ${createUserProgressDto.lesson_plan_id}`,
    );
    try {
      return await this.userProgressService.create(createUserProgressDto);
    } catch (error) {
      this.logger.error(`Failed to invite user to lesson plan.`, error.stack);
      throw new InternalServerErrorException(
        'A failure occurred during the invitation process.',
      );
    }
  }
}
