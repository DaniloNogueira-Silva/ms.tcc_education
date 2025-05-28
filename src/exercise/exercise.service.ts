import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Exercise } from './exercise.schema';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { UserPayload } from '../auth/auth.service';
import { CreateUserProgressDto } from '../user_progress/dto/create-user_progress.dto';
import { UserProgressService } from '../user_progress/user_progress.service';
import { UpdateUserProgressDto } from '../user_progress/dto/update-user_progress.dto';
import axios from 'axios';
import { LessonPlanContent } from 'src/lesson_plan_content/lesson_plan_content.schema';
import { LessonPlanContentService } from 'src/lesson_plan_content/lesson_plan_content.service';

@Injectable()
export class ExerciseService {
  constructor(
    @InjectModel(Exercise.name)
    private exerciseModel: Model<Exercise>,

    private readonly lessonPlanContentService: LessonPlanContentService,

    @InjectModel(LessonPlanContent.name)
    private lessonPlanContentModel: Model<LessonPlanContent>,

    private readonly userProgressService: UserProgressService,
  ) {}

  async create(createExerciseDto: CreateExerciseDto): Promise<Exercise> {
    const { lesson_plan_ids, ...exerciseData } = createExerciseDto;

    const createdExercise = new this.exerciseModel(exerciseData);
    const savedExercise = await createdExercise.save();

    if (lesson_plan_ids && lesson_plan_ids.length > 0) {
      await Promise.all(
        lesson_plan_ids.map((planId) =>
          this.lessonPlanContentService.create({
            lesson_plan_id: planId,
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

  async findAllByLessonPlan(planId: string) {
    const contentAssignments = await this.lessonPlanContentModel
      .find({
        lesson_plan_id: planId,
      })
      .exec();

    const exerciseIds = contentAssignments.map((content) => content.content_id);

    const exercises = await this.exerciseModel
      .find({
        _id: { $in: exerciseIds },
      })
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

  async remove(id: string): Promise<void> {
    const exercise = await this.exerciseModel.findById(id).exec();

    if (!exercise) {
      throw new NotFoundException('Exercício não encontrado');
    }

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

    const contentAssignment = await this.lessonPlanContentModel.findOne({
      content_id: exercise.id,
      content_type: 'exercise',
    });

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
    };

    const userProgress =
      await this.userProgressService.create(createUserProgress);

    // await axios.post(
    //   'http://localhost:3003/user-character/complete-activity',
    //   userProgress,
    // );
    return userProgress;
  }

  async teacherCorrection(exercise_id: string, data: UpdateUserProgressDto) {
    const studentUserId = data.user_id;

    if (!studentUserId) {
      throw new BadRequestException('ID do aluno é obrigatório');
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
      points: data.points,
    };

    await this.userProgressService.update(
      userProgress.id,
      updateUserProgressDto,
    );

    return {
      userProgressId: userProgress.id,
      grade: data.final_grade,
      points: data.points,
    };
  }
}
