import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Exercise } from './exercise.schema';
import {
  calculateExerciseCoins,
  calculateExerciseXp,
} from '../user_progress/xp.util';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { UserPayload } from '../auth/auth.service';
import { CreateUserProgressDto } from '../user_progress/dto/create-user_progress.dto';
import { UserProgressService } from '../user_progress/user_progress.service';
import { UpdateUserProgressDto } from '../user_progress/dto/update-user_progress.dto';
import { LessonPlanContentService } from '../lesson_plan_content/lesson_plan_content.service';
import { ExerciseListService } from '../exercise_list/exercise_list.service';
import { UserProgress } from '../user_progress/user_progress.schema';
import { HttpRequest } from '../utils/http.request';

@Injectable()
export class ExerciseService {
  private readonly logger = new Logger(ExerciseService.name);

  public constructor(
    @InjectModel(Exercise.name)
    private exerciseModel: Model<Exercise>,
    @Inject(forwardRef(() => ExerciseListService))
    private readonly exerciseListService: ExerciseListService,
    private readonly lessonPlanContentService: LessonPlanContentService,
    private readonly userProgressService: UserProgressService,
    private readonly httpService: HttpRequest,
  ) {}

  public async create(createExerciseDto: CreateExerciseDto): Promise<Exercise> {
    const { lesson_plan_ids, ...exerciseData } = createExerciseDto;
    this.logger.log(`Creating exercise with type: "${exerciseData.type}"`);
    let savedExercise: Exercise | null = null;
    try {
      const createdExercise = new this.exerciseModel(exerciseData);
      savedExercise = await createdExercise.save();

      if (lesson_plan_ids && lesson_plan_ids.length > 0) {
        await Promise.all(
          lesson_plan_ids.map((lesson_plan_id) =>
            this.lessonPlanContentService.create({
              lesson_plan_id,
              content_id: String(savedExercise?._id),
              content_type: 'exercise',
            }),
          ),
        );
      }
      return savedExercise;
    } catch (error) {
      if (savedExercise) {
        this.logger.error(
          `Failed to create associations for exercise ${savedExercise._id}. Rolling back.`,
        );
        await this.exerciseModel.findByIdAndDelete(savedExercise._id);
      }
      this.logger.error('Failed to create exercise.', error.stack);
      throw new InternalServerErrorException(
        'A failure occurred during exercise creation.',
      );
    }
  }

  public async findAll(): Promise<Exercise[]> {
    this.logger.log('Finding all exercises.');
    try {
      return this.exerciseModel.find().exec();
    } catch (error) {
      this.logger.error('Failed to find all exercises.', error.stack);
      throw new InternalServerErrorException(
        'A failure occurred while retrieving exercises.',
      );
    }
  }

  public async findAllByLessonPlan(
    lesson_plan_id: string,
  ): Promise<Exercise[]> {
    this.logger.log(
      `Finding all exercises for lesson plan ID: ${lesson_plan_id}`,
    );
    try {
      const contentIds =
        await this.lessonPlanContentService.getContentIdsByLessonPlan(
          lesson_plan_id,
          'exercise',
        );
      if (contentIds.length === 0) return [];
      return this.exerciseModel.find({ _id: { $in: contentIds } }).exec();
    } catch (error) {
      this.logger.error(
        `Failed to find exercises for lesson plan ID: ${lesson_plan_id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving exercises.',
      );
    }
  }

  public async findOne(id: string): Promise<Exercise> {
    this.logger.log(`Finding exercise with ID: ${id}`);
    try {
      const exercise = await this.exerciseModel.findById(id).exec();
      if (!exercise)
        throw new NotFoundException(`Exercise with ID "${id}" not found.`);
      return exercise;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to find exercise with ID: ${id}`, error.stack);
      throw new InternalServerErrorException(
        'A failure occurred while retrieving the exercise.',
      );
    }
  }

  public async update(
    id: string,
    updateExerciseDto: UpdateExerciseDto,
  ): Promise<Exercise> {
    this.logger.log(`Updating exercise with ID: ${id}`);
    try {
      const foundExercise = await this.exerciseModel.findById(id).exec();
      if (!foundExercise)
        throw new NotFoundException('Exercise not found for update.');
      if (
        updateExerciseDto.type &&
        updateExerciseDto.type !== foundExercise.type
      ) {
        throw new BadRequestException('Cannot change the exercise type.');
      }
      Object.assign(foundExercise, updateExerciseDto);
      return await foundExercise.save();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      this.logger.error(
        `Failed to update exercise with ID: ${id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while updating the exercise.',
      );
    }
  }

  public async updateExerciseAndLessonPlans(
    exerciseId: string,
    updateExerciseDto: UpdateExerciseDto,
  ) {
    this.logger.log(
      `Updating exercise and its plan associations for ID: ${exerciseId}`,
    );
    try {
      const { lesson_plan_ids, ...exerciseData } = updateExerciseDto;
      const updatedExercise = await this.update(exerciseId, exerciseData);

      if (!lesson_plan_ids) return updatedExercise;

      const currentAssociations =
        await this.lessonPlanContentService.getAssociationsByContent(
          exerciseId,
          'exercise',
        );
      const toRemove = currentAssociations.filter(
        (a) => !lesson_plan_ids.includes(a.lesson_plan_id),
      );

      await Promise.all(
        toRemove.map((assoc) =>
          this.lessonPlanContentService.remove(String(assoc._id)),
        ),
      );

      return updatedExercise;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      this.logger.error(
        `Failed to update exercise and plan associations for ID: ${exerciseId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred during the update process.',
      );
    }
  }

  public async remove(id: string): Promise<void> {
    this.logger.log(`Removing exercise with ID: ${id}`);
    try {
      await this.lessonPlanContentService.removeAllAssociationsByContentId(
        id,
        'exercise',
      );
      await this.exerciseListService.removeExerciseFromLists(id);
      await this.exerciseModel.findByIdAndDelete(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `Failed to remove exercise with ID: ${id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while removing the exercise.',
      );
    }
  }

  public async getByUserRole(userPayload: UserPayload): Promise<Exercise[]> {
    this.logger.log(
      `Getting exercises for user ID: ${userPayload.id} with role: ${userPayload.role}`,
    );
    try {
      if (userPayload.role === 'TEACHER') {
        return this.exerciseModel.find({ teacher_id: userPayload.id }).exec();
      }
      return [];
    } catch (error) {
      this.logger.error(
        `Failed to get exercises for user ID: ${userPayload.id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving data.',
      );
    }
  }

  public async submitAnswer(
    userPayload: UserPayload,
    exercise_id: string,
    createUserProgressDto: CreateUserProgressDto,
  ): Promise<any> {
    this.logger.log(
      `User ${userPayload.id} submitting answer for exercise ${exercise_id}.`,
    );
    let userProgress: UserProgress | null = null;
    try {
      const exercise = await this.findOne(exercise_id);
      const contentAssignment =
        await this.lessonPlanContentService.findOneByContent(
          exercise.id,
          'exercise',
        );
      if (!contentAssignment)
        throw new NotFoundException(
          'Exercise is not associated with any lesson plan.',
        );

      const createUserProgress: CreateUserProgressDto = {
        user_id: userPayload.id,
        lesson_plan_id: contentAssignment.lesson_plan_id,
        answer: createUserProgressDto.answer,
        external_id: exercise_id,
        type: 'EXERCISE',
        points: calculateExerciseXp(exercise.difficulty),
        coins: calculateExerciseCoins(exercise.difficulty),
      };

      userProgress = await this.userProgressService.create(createUserProgress);

      await this.httpService.completeActivity(userProgress);

      return { ...userProgress.toObject(), points: createUserProgress.points };
    } catch (error) {
      if (userProgress) {
        this.logger.error(
          `External service call failed after creating progress ${userProgress._id}. Rolling back.`,
        );
        await this.userProgressService.remove(String(userProgress._id));
      }
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `Failed to submit answer for user ${userPayload.id}.`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while submitting the answer.',
      );
    }
  }

  public async teacherCorrection(
    exercise_id: string,
    data: UpdateUserProgressDto,
  ): Promise<any> {
    this.logger.log(
      `Teacher correcting exercise ${exercise_id} for user ${data.user_id}`,
    );
    try {
      const studentUserId = data.user_id;
      if (!studentUserId)
        throw new BadRequestException('Student ID is required.');

      const exercise = await this.findOne(exercise_id);
      const userProgress =
        await this.userProgressService.findOneByExerciseAndUser(
          exercise_id,
          studentUserId,
        );

      const updateUserProgressDto: UpdateUserProgressDto = {
        final_grade: data.final_grade,
        points: calculateExerciseXp(exercise.difficulty),
      };

      await this.userProgressService.update(
        userProgress.id,
        updateUserProgressDto,
      );

      return {
        userProgressId: userProgress.id,
        grade: data.final_grade,
        points: updateUserProgressDto.points,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      this.logger.error(
        `Failed to apply teacher correction for exercise ${exercise_id}.`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred during teacher correction.',
      );
    }
  }

  public async isCompletedByUser(
    exercise_id: string,
    userId: string,
  ): Promise<boolean> {
    this.logger.log(
      `Checking if exercise ${exercise_id} is completed by user ${userId}.`,
    );
    try {
      return this.userProgressService.hasCompletedExercise(exercise_id, userId);
    } catch (error) {
      this.logger.error(
        `Failed to check completion status for exercise ${exercise_id}.`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while checking completion status.',
      );
    }
  }

  public async isDeadlinePassed(exercise_id: string): Promise<boolean> {
    this.logger.log(
      `Checking if deadline has passed for exercise ${exercise_id}.`,
    );
    try {
      return await this.lessonPlanContentService.isDeadlinePassed(
        exercise_id,
        'exercise',
      );
    } catch (error) {
      this.logger.error(
        `Failed to check deadline for exercise ${exercise_id}.`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while checking the deadline.',
      );
    }
  }
}
