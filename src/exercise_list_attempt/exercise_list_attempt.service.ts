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
import {
  calculateBaseExerciseCoins,
  calculateBaseExerciseXp,
  calculateExerciseCoins,
  calculateExerciseXp,
} from '../user_progress/xp.util';
import { ExerciseService } from '../exercise/exercise.service';
import { HttpRequest } from '../utils/http.request';

@Injectable()
export class ExerciseListAttemptService {
  private readonly logger = new Logger(ExerciseListAttemptService.name);

  public constructor(
    @InjectModel(ExerciseListAttempt.name)
    private attemptModel: Model<ExerciseListAttempt>,
    private readonly userProgressService: UserProgressService,
    private readonly exerciseService: ExerciseService,
    private readonly httpService: HttpRequest,
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

  public async gradeAttempt(attemptId: string, grade: number): Promise<any> {
    this.logger.log(
      `Grading attempt with ID: ${attemptId} with grade: ${grade}`,
    );

    try {
      // 1) Ler a attempt atual
      const attempt = await this.attemptModel.findById(attemptId);
      if (!attempt)
        throw new NotFoundException(`Attempt "${attemptId}" not found.`);

      // 2) Idempotência: se a nota já é a mesma, não credita de novo
      const oldGrade = typeof attempt.grade === 'number' ? attempt.grade : 0;
      if (oldGrade === grade) {
        const progress = await this.userProgressService.getUserProgressById(
          attempt.user_progress_id,
        );
        return {
          ...attempt.toObject(),
          points: 0,
          coins: 0,
          current_points: progress.points,
          current_coins: progress.coins,
        };
      }

      // 3) Buscar dados necessários
      const exercise = await this.exerciseService.findOne(attempt.exercise_id);
      const userProgress = await this.userProgressService.getUserProgressById(
        attempt.user_progress_id,
      );

      // 4) Calcular DELTA (novo - antigo), nunca negativo
      const maxGrade = exercise.grade || 1;
      const oldRatio = maxGrade ? oldGrade / maxGrade : 0;
      const newRatio = maxGrade ? grade / maxGrade : 0;

      const maxXp = calculateExerciseXp(exercise.difficulty);
      const maxCoins = calculateExerciseCoins(exercise.difficulty);

      let xpDelta = Math.max(0, maxXp * newRatio - maxXp * oldRatio);
      let coinsDelta = Math.max(0, maxCoins * newRatio - maxCoins * oldRatio);

      // 5) CAS: atualiza a attempt somente se a grade ainda for a que lemos
      const casFilter = { _id: attemptId, grade: oldGrade };
      const casUpdate = { $set: { grade } };
      let updatedAttempt = await this.attemptModel.findOneAndUpdate(
        casFilter,
        casUpdate,
        { new: true },
      );

      // 6) Se alguém alterou no meio do caminho, reler e recalcular uma vez
      if (!updatedAttempt) {
        const fresh = await this.attemptModel.findById(attemptId);
        if (!fresh)
          throw new NotFoundException(
            `Attempt "${attemptId}" not found after CAS.`,
          );

        const freshOldGrade = typeof fresh.grade === 'number' ? fresh.grade : 0;

        // Se já está com a mesma nota que queremos aplicar, delta = 0
        if (freshOldGrade === grade) {
          const progress = await this.userProgressService.getUserProgressById(
            fresh.user_progress_id,
          );
          return {
            ...fresh.toObject(),
            points: 0,
            coins: 0,
            current_points: progress.points,
            current_coins: progress.coins,
          };
        }

        // Recalcular delta contra a grade realmente atual
        const freshOldRatio = maxGrade ? freshOldGrade / maxGrade : 0;
        xpDelta = Math.max(0, maxXp * newRatio - maxXp * freshOldRatio);
        coinsDelta = Math.max(
          0,
          maxCoins * newRatio - maxCoins * freshOldRatio,
        );

        // Aplicar update agora sem pré-condição (ou poderia encadear outro CAS se quiser)
        updatedAttempt = await this.attemptModel.findByIdAndUpdate(
          attemptId,
          { grade },
          { new: true },
        );
      }

      // 7) Recalcular final_grade (soma das notas de todas as attempts deste user_progress)
      const allAttempts = await this.attemptModel
        .find({ user_progress_id: attempt.user_progress_id })
        .exec();
      const totalGrade = allAttempts.reduce(
        (sum, a) => sum + (a.grade || 0),
        0,
      );

      // 8) Atualizar progresso (sem $inc, usando seu update atual)
      const updatedProgress = await this.userProgressService.update(
        attempt.user_progress_id,
        {
          points: (userProgress.points ?? 0) + xpDelta,
          coins: (userProgress.coins ?? 0) + coinsDelta,
          final_grade: totalGrade,
        },
      );

      this.logger.log(`PONTOS DO ALUNO - ID: ${attempt.user_progress_id}`);
      this.logger.log(`Pontos atuais: ${userProgress.points ?? 0}`);
      this.logger.log(`Pontos de bônus do exercício (delta): ${xpDelta}`);
      this.logger.log(
        `Pontos finais após a atualização: ${updatedProgress.points}`,
      );

      // 9) Notificar serviço externo com os DELTAS
      await this.httpService.completeActivity({
        ...(updatedProgress.toObject?.() ?? updatedProgress),
        points: xpDelta,
        coins: coinsDelta,
      });

      // 10) Garantia contra null em updatedAttempt
      const attemptObj = updatedAttempt
        ? updatedAttempt.toObject()
        : { _id: attemptId, grade };

      return {
        ...attemptObj,
        points: xpDelta,
        coins: coinsDelta,
        current_points: (userProgress.points ?? 0) + xpDelta,
        current_coins: (userProgress.coins ?? 0) + coinsDelta,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
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
