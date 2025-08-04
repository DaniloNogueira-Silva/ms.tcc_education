import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Exercise, ExerciseDifficulty } from './exercise.schema';
import { calculateExerciseXp } from '../user_progress/xp.util';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { UserPayload } from '../auth/auth.service';
import { CreateUserProgressDto } from '../user_progress/dto/create-user_progress.dto';
import { UserProgressService } from '../user_progress/user_progress.service';
import { UpdateUserProgressDto } from '../user_progress/dto/update-user_progress.dto';
import axios from 'axios';
import { LessonPlanContentService } from 'src/lesson_plan_content/lesson_plan_content.service';
import { ExerciseListService } from 'src/exercise_list/exercise_list.service';

@Injectable()
export class ExerciseService {
  constructor(
    @InjectModel(Exercise.name)
    private exerciseModel: Model<Exercise>,

    @Inject(forwardRef(() => ExerciseListService))
    private readonly exerciseListService: ExerciseListService,

    private readonly lessonPlanContentService: LessonPlanContentService,

    private readonly userProgressService: UserProgressService,
  ) {}

  async create(createExerciseDto: CreateExerciseDto): Promise<Exercise> {
    const { lesson_plan_ids, ...exerciseData } = createExerciseDto;

    const createdExercise = new this.exerciseModel(exerciseData);
    const savedExercise = await createdExercise.save();

    if (lesson_plan_ids && lesson_plan_ids.length > 0) {
      await Promise.all(
        lesson_plan_ids.map((lesson_plan_id) =>
          this.lessonPlanContentService.create({
            lesson_plan_id,
            content_id: String(savedExercise._id),
            content_type: 'exercise',
          }),
        ),
      );
    }

    return savedExercise;
  }

  async findAll() {
    const exercises = await this.exerciseModel.find().exec();

    return exercises;
  }

  async findAllByLessonPlan(lesson_plan_id: string) {
    const contentIds =
      await this.lessonPlanContentService.getContentIdsByLessonPlan(
        lesson_plan_id,
      );

    if (contentIds.length === 0) {
      return [];
    }

    const exercises = await this.exerciseModel
      .find({ _id: { $in: contentIds } })
      .exec();

    return exercises;
  }

  async findOne(id: string): Promise<Exercise> {
    const exercise = await this.exerciseModel.findById(id);

    if (!exercise) {
      throw new NotFoundException('Exercício não encontrado');
    }

    return exercise;
  }

  async update(
    id: string,
    updateExerciseDto: UpdateExerciseDto,
  ): Promise<Exercise> {
    const foundExercise = await this.exerciseModel.findById(id).exec();

    if (!foundExercise) {
      throw new NotFoundException('Exercício não encontrado');
    }

    if (
      updateExerciseDto.type &&
      updateExerciseDto.type !== foundExercise.type
    ) {
      throw new BadRequestException(
        'Não é possível alterar o tipo do exercício.',
      );
    }

    Object.assign(foundExercise, updateExerciseDto);

    return foundExercise.save();
  }

  async updateExerciseAndLessonPlans(
    exerciseId: string,
    updateExerciseDto: UpdateExerciseDto,
  ) {
    const { lesson_plan_ids, ...exerciseData } = updateExerciseDto;
    const updatedExercise = await this.update(exerciseId, exerciseData);

    if (!lesson_plan_ids) {
      return updatedExercise;
    }
    const currentAssociations =
      await this.lessonPlanContentService.getAssociationsByContent(
        exerciseId,
        'exercise',
      );

    const currentPlanIds = currentAssociations.map((a) => a.lesson_plan_id);

    const toRemove = currentAssociations.filter(
      (a) => !lesson_plan_ids.includes(a.lesson_plan_id),
    );

    const toAdd = lesson_plan_ids.filter((id) => !currentPlanIds.includes(id));

    await Promise.all(
      toRemove.map((assoc) =>
        this.lessonPlanContentService.remove(String(assoc._id)),
      ),
    );

    await Promise.all(
      toAdd.map((id) =>
        this.lessonPlanContentService.create({
          lesson_plan_id: id,
          content_id: exerciseId,
          content_type: 'exercise',
        }),
      ),
    );

    return updatedExercise;
  }

  async remove(id: string): Promise<void> {
    const exercise = await this.exerciseModel.findById(id).exec();
    if (!exercise) {
      throw new NotFoundException('Exercício não encontrado');
    }

    await this.lessonPlanContentService.removeAllAssociationsByContentId(
      id,
      'exercise',
    );

    await this.exerciseListService.removeExerciseFromLists(id);

    await this.exerciseModel.findByIdAndDelete(id);
  }

  async getByUserRole(userPayload: UserPayload): Promise<any> {
    const userRole = userPayload.role;

    if (userRole === 'TEACHER') {
      const exercises = await this.exerciseModel
        .find({ teacher_id: userPayload.id })
        .exec();

      return exercises;
    }

    return [];
  }

  async submitAnswer(
    userPayload: UserPayload,
    exercise_id: string,
    createUserProgressDto: CreateUserProgressDto,
  ): Promise<CreateUserProgressDto> {
    const exercise = await this.exerciseModel.findById(exercise_id);

    if (!exercise) {
      throw new NotFoundException('Exercício não encontrado');
    }

    const contentAssignment =
      await this.lessonPlanContentService.findOneByContent(
        exercise.id,
        'exercise',
      );

    if (!contentAssignment) {
      throw new NotFoundException(
        'Associação do exercício com plano de aula não encontrada',
      );
    }

    const createUserProgress: CreateUserProgressDto = {
      user_id: userPayload.id,
      lesson_plan_id: contentAssignment.lesson_plan_id,
      answer: createUserProgressDto.answer,
      external_id: exercise_id,
      type: 'EXERCISE',
      points: calculateExerciseXp(exercise.difficulty),
    };

    const userProgress =
      await this.userProgressService.create(createUserProgress);

    await axios.post(
      'http://localhost:3003/user-character/complete-activity',
      userProgress,
    );

    return {
      ...userProgress,
      points: calculateExerciseXp(exercise.difficulty),
    };
  }

  async teacherCorrection(exercise_id: string, data: UpdateUserProgressDto) {
    const studentUserId = data.user_id;

    if (!studentUserId) {
      throw new BadRequestException('ID do aluno é obrigatório');
    }

    const exercise = await this.exerciseModel.findById(exercise_id);

    if (!exercise) {
      throw new NotFoundException('Exercício não encontrado');
    }

    const userProgress =
      await this.userProgressService.findOneByExerciseAndUser(
        exercise_id,
        studentUserId,
      );

    if (!userProgress) {
      throw new NotFoundException('Progresso do usuário não encontrado');
    }

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
      points: calculateExerciseXp(exercise.difficulty),
    };
  }

  async isCompletedByUser(
    exercise_id: string,
    userId: string,
  ): Promise<boolean> {
    return this.userProgressService.hasCompletedExercise(exercise_id, userId);
  }

  async isDeadlinePassed(exercise_id: string): Promise<boolean> {
    const exercise = await this.exerciseModel
      .findById(exercise_id, { due_date: 1 })
      .exec();

    if (!exercise) {
      throw new NotFoundException('Exercício não encontrado');
    }

    if (!exercise.due_date) {
      return false;
    }

    return new Date(exercise.due_date).getTime() < Date.now();
  }
}
