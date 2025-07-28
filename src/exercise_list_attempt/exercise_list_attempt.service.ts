import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateExerciseListAttemptDto } from './dto/create-exercise_list_attempt.dto';
import { UpdateExerciseListAttemptDto } from './dto/update-exercise_list_attempt.dto';
import { ExerciseListAttempt } from './exercise_list_attempt.schema';
import { UserProgressService } from '../user_progress/user_progress.service';

@Injectable()
export class ExerciseListAttemptService {
  constructor(
    @InjectModel(ExerciseListAttempt.name)
    private attemptModel: Model<ExerciseListAttempt>,
    private readonly userProgressService: UserProgressService,
  ) {}

  async create(
    createDto: CreateExerciseListAttemptDto,
  ): Promise<ExerciseListAttempt> {
    const created = new this.attemptModel(createDto);
    return created.save();
  }

  async findByUserProgress(
    user_progress_id: string,
  ): Promise<ExerciseListAttempt[]> {
    return this.attemptModel.find({ user_progress_id }).exec();
  }

  async update(
    id: string,
    updateDto: UpdateExerciseListAttemptDto,
  ): Promise<ExerciseListAttempt | null> {
    return this.attemptModel.findByIdAndUpdate(id, updateDto, { new: true });
  }

  async gradeAttempt(
    attemptId: string,
    grade: number,
  ): Promise<ExerciseListAttempt> {
    const attempt = await this.attemptModel.findByIdAndUpdate(
      attemptId,
      { grade },
      { new: true },
    );
    if (!attempt) throw new NotFoundException('Tentativa não encontrada');

    const attempts = await this.findByUserProgress(attempt.user_progress_id);
    const grades = attempts.map((a) => a.grade ?? 0);
    const final_grade = grades.length
      ? grades.reduce((a, b) => a + b, 0) / grades.length
      : 0;
    await this.userProgressService.update(attempt.user_progress_id, {
      final_grade,
    });

    return attempt;
  }
}
