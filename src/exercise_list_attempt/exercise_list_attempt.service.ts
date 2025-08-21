import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateExerciseListAttemptDto } from './dto/create-exercise_list_attempt.dto';
import { UpdateExerciseListAttemptDto } from './dto/update-exercise_list_attempt.dto';
import { ExerciseListAttempt } from './exercise_list_attempt.schema';
import { UserProgressService } from '../user_progress/user_progress.service';

@Injectable()
export class ExerciseListAttemptService {
  private readonly logger = new Logger(ExerciseListAttemptService.name);

  public constructor(
    @InjectModel(ExerciseListAttempt.name)
    private attemptModel: Model<ExerciseListAttempt>,
    private readonly userProgressService: UserProgressService,
  ) {}

  public async create(
    createDto: CreateExerciseListAttemptDto,
  ): Promise<ExerciseListAttempt> {
    this.logger.log(
      `Creating new exercise list attempt for progress ID: ${createDto.user_progress_id}`,
    );
    try {
      const created = new this.attemptModel(createDto);
      return await created.save();
    } catch (error) {
      this.logger.error('Failed to create exercise list attempt.', error.stack);
      throw new InternalServerErrorException(
        'A failure occurred while creating the attempt.',
      );
    }
  }

  public async findByUserProgress(
    user_progress_id: string,
  ): Promise<ExerciseListAttempt[]> {
    this.logger.log(
      `Finding attempts for user progress ID: ${user_progress_id}`,
    );
    try {
      return this.attemptModel.find({ user_progress_id }).exec();
    } catch (error) {
      this.logger.error(
        `Failed to find attempts for user progress ID: ${user_progress_id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while fetching attempts.',
      );
    }
  }

  public async update(
    id: string,
    updateDto: UpdateExerciseListAttemptDto,
  ): Promise<ExerciseListAttempt | null> {
    this.logger.log(`Updating attempt with ID: ${id}`);
    try {
      const updatedAttempt = await this.attemptModel.findByIdAndUpdate(
        id,
        updateDto,
        { new: true },
      );
      if (!updatedAttempt) {
        throw new NotFoundException(
          `Attempt with ID "${id}" not found to update.`,
        );
      }
      return updatedAttempt;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update attempt with ID: ${id}`, error.stack);
      throw new InternalServerErrorException(
        'A failure occurred while updating the attempt.',
      );
    }
  }

  public async gradeAttempt(
    attemptId: string,
    grade: number,
  ): Promise<ExerciseListAttempt> {
    this.logger.log(
      `Grading attempt with ID: ${attemptId} with grade: ${grade}`,
    );
    try {
      const attempt = await this.attemptModel.findByIdAndUpdate(
        attemptId,
        { grade, graded: true },
        { new: true },
      );
      if (!attempt) {
        throw new NotFoundException(
          `Attempt with ID "${attemptId}" not found.`,
        );
      }

      const attempts = await this.findByUserProgress(attempt.user_progress_id);
      const gradedAttempts = attempts.filter((a) => a.grade);
      const grades = gradedAttempts.map((a) => a.grade ?? 0);
      const final_grade = grades.length ? grades.reduce((a, b) => a + b, 0) : 0;

      await this.userProgressService.update(attempt.user_progress_id, {
        final_grade,
      });

      return attempt;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to grade attempt with ID: ${attemptId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while grading the attempt.',
      );
    }
  }
}
