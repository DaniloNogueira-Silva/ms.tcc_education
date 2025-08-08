import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserPayload } from '../auth/auth.service';
import { UserProgressService } from '../user_progress/user_progress.service';
import { CreateUserProgressDto } from '../user_progress/dto/create-user_progress.dto';
import { UserProgress } from '../user_progress/user_progress.schema';
import { ExerciseList } from './exercise_list.schema';
import { CreateExerciseListDto } from './dto/create-exercise_list.dto';
import { UpdateExerciseListDto } from './dto/update-exercise_list.dto';
import { LessonPlanContentService } from '../lesson_plan_content/lesson_plan_content.service';
import { ExerciseService } from '../exercise/exercise.service';
import { ExerciseListAttemptService } from '../exercise_list_attempt/exercise_list_attempt.service';
import { ExerciseListAttempt } from '../exercise_list_attempt/exercise_list_attempt.schema';
import {
  calculateExerciseCoins,
  calculateExerciseListCoins,
  calculateExerciseListXp,
  calculateExerciseXp,
} from '../user_progress/xp.util';
import { HttpRequest } from '../utils/http.request';

@Injectable()
export class ExerciseListService {
  private readonly logger = new Logger(ExerciseListService.name);

  public constructor(
    @InjectModel(ExerciseList.name)
    private exerciselistModel: Model<ExerciseList>,
    private readonly lessonPlanContentService: LessonPlanContentService,
    private readonly userProgressService: UserProgressService,
    private readonly exerciseService: ExerciseService,
    private readonly attemptService: ExerciseListAttemptService,
    private readonly httpService: HttpRequest,
  ) {}

  public async create(
    createExerciseListDto: CreateExerciseListDto,
  ): Promise<ExerciseList> {
    const { lesson_plan_ids, ...exerciseListData } = createExerciseListDto;
    this.logger.log(
      `Creating exercise list with name: "${exerciseListData.name}"`,
    );
    let savedExerciseList: ExerciseList | null = null;
    try {
      const createdExerciseList = new this.exerciselistModel(exerciseListData);
      savedExerciseList = await createdExerciseList.save();

      if (lesson_plan_ids && lesson_plan_ids.length > 0) {
        await Promise.all(
          lesson_plan_ids.map((lesson_plan_id) =>
            this.lessonPlanContentService.create({
              lesson_plan_id,
              content_id: String(savedExerciseList?._id),
              content_type: 'exercise_list',
            }),
          ),
        );
      }
      return savedExerciseList;
    } catch (error) {
      if (savedExerciseList) {
        this.logger.error(
          `Failed to create associations for exercise list ${savedExerciseList._id}. Rolling back.`,
        );
        await this.exerciselistModel.findByIdAndDelete(savedExerciseList._id);
      }
      this.logger.error('Failed to create exercise list.', error.stack);
      throw new InternalServerErrorException(
        'A failure occurred during exercise list creation.',
      );
    }
  }

  public async findAll(): Promise<ExerciseList[]> {
    this.logger.log('Finding all exercise lists.');
    try {
      return this.exerciselistModel.find().exec();
    } catch (error) {
      this.logger.error('Failed to find all exercise lists.', error.stack);
      throw new InternalServerErrorException(
        'A failure occurred while retrieving exercise lists.',
      );
    }
  }

  public async findAllByLessonPlan(lesson_plan_id: string, user_id?: string) {
    this.logger.log(
      `Finding all exercise lists for lesson plan ID: ${lesson_plan_id}`,
    );
    try {
      const contentIds =
        await this.lessonPlanContentService.getContentIdsByLessonPlan(
          lesson_plan_id,
          'exercise_list',
        );
      if (contentIds.length === 0) return [];
      const exercise_lists = await this.exerciselistModel
        .find({ _id: { $in: contentIds } })
        .exec();
      return exercise_lists;
    } catch (error) {
      this.logger.error(
        `Failed to find exercise lists for lesson plan ID: ${lesson_plan_id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving exercise lists.',
      );
    }
  }

  public async findOne(id: string): Promise<ExerciseList> {
    this.logger.log(`Finding exercise list with ID: ${id}`);
    try {
      const exerciseList = await this.exerciselistModel.findById(id).exec();
      if (!exerciseList) {
        throw new NotFoundException(`Exercise list with ID "${id}" not found.`);
      }
      return exerciseList;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `Failed to find exercise list with ID: ${id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving the exercise list.',
      );
    }
  }

  public async update(
    id: string,
    updateDto: UpdateExerciseListDto,
  ): Promise<ExerciseList | null> {
    this.logger.log(`Updating exercise list with ID: ${id}`);
    try {
      const updatedExerciseList =
        await this.exerciselistModel.findByIdAndUpdate(id, updateDto, {
          new: true,
        });
      if (!updatedExerciseList) {
        throw new NotFoundException(
          `Exercise list with ID "${id}" not found to update.`,
        );
      }
      return updatedExerciseList;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `Failed to update exercise list with ID: ${id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while updating the exercise list.',
      );
    }
  }

  public async updateExerciseListAndLessonPlans(
    exercise_list_id: string,
    updateDto: UpdateExerciseListDto,
  ) {
    this.logger.log(
      `Updating exercise list and its plan associations for ID: ${exercise_list_id}`,
    );
    try {
      const { lesson_plan_ids, ...exerciseListData } = updateDto;
      const updatedExerciseList = await this.update(
        exercise_list_id,
        exerciseListData,
      );

      if (!lesson_plan_ids) return updatedExerciseList;

      const currentAssociations =
        await this.lessonPlanContentService.getAssociationsByContent(
          exercise_list_id,
          'exercise_list',
        );
      const currentPlanIds = currentAssociations.map((a) => a.lesson_plan_id);
      const toRemove = currentAssociations.filter(
        (a) => !lesson_plan_ids.includes(a.lesson_plan_id),
      );
      const toAdd = lesson_plan_ids.filter(
        (id) => !currentPlanIds.includes(id),
      );

      await Promise.all(
        toRemove.map((assoc) =>
          this.lessonPlanContentService.remove(String(assoc._id)),
        ),
      );
      await Promise.all(
        toAdd.map((id) =>
          this.lessonPlanContentService.create({
            lesson_plan_id: id,
            content_id: exercise_list_id,
            content_type: 'exercise_list',
          }),
        ),
      );
      return updatedExerciseList;
    } catch (error) {
      this.logger.error(
        `Failed to update exercise list and plan associations for ID: ${exercise_list_id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred during the update process.',
      );
    }
  }

  public async remove(id: string): Promise<void> {
    this.logger.log(`Removing exercise list with ID: ${id}`);
    try {
      const result = await this.exerciselistModel.findByIdAndDelete(id);
      if (!result) {
        throw new NotFoundException(
          `Exercise list with ID "${id}" not found to remove.`,
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `Failed to remove exercise list with ID: ${id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while removing the exercise list.',
      );
    }
  }

  public async removeExerciseFromLists(exerciseId: string): Promise<void> {
    this.logger.log(
      `Removing exercise ID ${exerciseId} from all exercise lists.`,
    );
    try {
      await this.exerciselistModel.updateMany(
        { exercises_ids: exerciseId },
        { $pull: { exercises_ids: exerciseId } },
      );
    } catch (error) {
      this.logger.error(
        `Failed to remove exercise ${exerciseId} from lists.`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while updating exercise lists.',
      );
    }
  }

  public async getByUserRole(userPayload: UserPayload): Promise<any> {
    this.logger.log(
      `Getting exercise lists for user ID: ${userPayload.id} with role: ${userPayload.role}`,
    );
    try {
      if (userPayload.role === 'TEACHER') {
        return this.exerciselistModel
          .find({ teacher_id: userPayload.id })
          .exec();
      }
    } catch (error) {
      this.logger.error(
        `Failed to get exercise lists for user ID: ${userPayload.id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving data.',
      );
    }
  }

  public async submitExerciseListAnswers(
    userPayload: UserPayload,
    exercise_list_id: string,
    exercise_id: string,
    createUserProgressDto: CreateUserProgressDto,
  ): Promise<ExerciseListAttempt> {
    this.logger.log(
      `User ${userPayload.id} submitting answer for exercise ${exercise_id} in list ${exercise_list_id}.`,
    );
    try {
      const exercise = await this.exerciseService.findOne(exercise_id);
      if (!exercise) throw new NotFoundException('Exercise not found.');

      const exerciseList =
        await this.exerciselistModel.findById(exercise_list_id);
      if (!exerciseList)
        throw new NotFoundException('Exercise list not found.');

      const contentAssignment =
        await this.lessonPlanContentService.findOneByContent(
          exerciseList.id,
          'exercise_list',
        );
      if (!contentAssignment)
        throw new NotFoundException(
          'Exercise list is not associated with any lesson plan.',
        );

      let userProgress: UserProgress;
      try {
        userProgress = await this.userProgressService.findOneByExerciseAndUser(
          exerciseList.id,
          userPayload.id,
        );
      } catch (err) {
        const createUserProgress: CreateUserProgressDto = {
          user_id: userPayload.id,
          lesson_plan_id: contentAssignment.lesson_plan_id,
          external_id: exerciseList.id,
          type: 'EXERCISE_LIST',
        };
        userProgress =
          await this.userProgressService.create(createUserProgress);
      }

      const attempt = await this.attemptService.create({
        user_progress_id: userProgress.id,
        exercise_id,
        answer: createUserProgressDto.answer,
      });

      await this.httpService.completeActivity(userProgress);
      return attempt;
    } catch (error) {
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

  public async markExerciseListAsCompleted(
    userPayload: UserPayload,
    exercise_list_id: string,
  ): Promise<UserProgress> {
    this.logger.log(
      `User ${userPayload.id} marking exercise list ${exercise_list_id} as completed.`,
    );
    try {
      const exerciselist =
        await this.exerciselistModel.findById(exercise_list_id);
      if (!exerciselist)
        throw new NotFoundException('Exercise list not found.');

      const contentAssignment =
        await this.lessonPlanContentService.findOneByContent(
          exerciselist.id,
          'exercise_list',
        );
      if (!contentAssignment)
        throw new NotFoundException(
          'Exercise list is not associated with any lesson plan.',
        );

      let userProgress: UserProgress;
      try {
        userProgress = await this.userProgressService.findOneByExerciseAndUser(
          exercise_list_id,
          userPayload.id,
        );
      } catch (err) {
        const createUserProgress: CreateUserProgressDto = {
          user_id: userPayload.id,
          lesson_plan_id: contentAssignment.lesson_plan_id,
          external_id: exercise_list_id,
          type: 'EXERCISE_LIST',
        };
        userProgress =
          await this.userProgressService.create(createUserProgress);
      }

      const exercises = await Promise.all(
        exerciselist.exercises_ids.map((id) =>
          this.exerciseService.findOne(String(id)),
        ),
      );
      const difficulties = exercises.map((e) => e.difficulty);
      const xp = calculateExerciseListXp(difficulties);
      const coins = calculateExerciseListCoins(difficulties);
      await this.userProgressService.update(userProgress.id, { points: xp, coins: coins });
      return userProgress;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `Failed to mark exercise list ${exercise_list_id} as completed for user ${userPayload.id}.`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while marking the exercise list as completed.',
      );
    }
  }

  public async isCompletedByUser(
    exercise_list_id: string,
    userId: string,
  ): Promise<boolean> {
    this.logger.log(
      `Checking if exercise list ${exercise_list_id} is completed by user ${userId}.`,
    );
    try {
      return this.userProgressService.hasCompletedExercise(
        exercise_list_id,
        userId,
      );
    } catch (error) {
      this.logger.error(
        `Failed to check completion status for exercise list ${exercise_list_id}.`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while checking completion status.',
      );
    }
  }

  public async isDeadlinePassed(exercise_list_id: string): Promise<boolean> {
    this.logger.log(
      `Checking if deadline has passed for exercise list ${exercise_list_id}.`,
    );
    try {
      const exercise_list = await this.exerciselistModel
        .findById(exercise_list_id, { due_date: 1 })
        .exec();
      if (!exercise_list)
        throw new NotFoundException('Exercise list not found.');
      if (!exercise_list.due_date) return false;
      return new Date(exercise_list.due_date).getTime() < Date.now();
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `Failed to check deadline for exercise list ${exercise_list_id}.`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while checking the deadline.',
      );
    }
  }
}
