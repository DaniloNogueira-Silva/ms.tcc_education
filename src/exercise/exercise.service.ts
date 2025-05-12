import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Exercise,
  MultipleChoiceExercise,
  TrueFalseExercise,
  ExerciseType,
} from './exercise.schema';
import {
  CreateExerciseDto,
  CreateMultipleChoiceExerciseDto,
  CreateTrueFalseExerciseDto,
} from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { UserPayload } from '../auth/auth.service';
import { CreateUserProgressDto } from '../user_progress/dto/create-user_progress.dto';
import { UserProgressService } from '../user_progress/user_progress.service';
import { RabbitMQProducerToGameService } from '../rabbitmq/producers/rmq-to-game-producer';
import { UpdateUserProgressDto } from '../user_progress/dto/update-user_progress.dto';

@Injectable()
export class ExerciseService {
  constructor(
    @InjectModel(Exercise.name)
    private exerciseModel: Model<Exercise>,
    @InjectModel(MultipleChoiceExercise.name)
    private multipleChoiceExerciseModel: Model<MultipleChoiceExercise>,
    @InjectModel(TrueFalseExercise.name)
    private trueFalseExerciseModel: Model<TrueFalseExercise>,

    private readonly userProgressService: UserProgressService,
  ) {}

  async create(createExerciseDto: CreateExerciseDto): Promise<Exercise> {
    let createdExercise: Exercise;

    switch (createExerciseDto.type) {
      case ExerciseType.MULTIPLE_CHOICE:
        createdExercise = new this.multipleChoiceExerciseModel(
          createExerciseDto as CreateMultipleChoiceExerciseDto,
        );
        break;
      case ExerciseType.TRUE_FALSE:
        createdExercise = new this.trueFalseExerciseModel(
          createExerciseDto as CreateTrueFalseExerciseDto,
        );
        break;
      default:
        createdExercise = new this.exerciseModel(createExerciseDto);
    }

    return createdExercise.save();
  }

  async findAll() {
    const [exercises, multipleChoiceExercises, trueFalseExercises] =
      await Promise.all([
        this.exerciseModel.find().exec(),
        this.multipleChoiceExerciseModel.find().exec(),
        this.trueFalseExerciseModel.find().exec(),
      ]);

    return [...exercises, ...multipleChoiceExercises, ...trueFalseExercises];
  }

  async findAllByLessonPlan(planId: string) {
    const [exercises, multipleChoiceExercises, trueFalseExercises] =
      await Promise.all([
        this.exerciseModel.find({ lesson_plan_id: planId }).exec(),
        this.multipleChoiceExerciseModel
          .find({ lesson_plan_id: planId })
          .exec(),
        this.trueFalseExerciseModel.find({ lesson_plan_id: planId }).exec(),
      ]);

    return [...exercises, ...multipleChoiceExercises, ...trueFalseExercises];
  }

  async findOne(id: string): Promise<Exercise> {
    let exercise = await this.exerciseModel.findById(id);

    if (!exercise) {
      exercise = await this.multipleChoiceExerciseModel.findById(id);
    }

    if (!exercise) {
      exercise = await this.trueFalseExerciseModel.findById(id);
    }

    if (!exercise) {
      throw new NotFoundException('Exercício não encontrado');
    }

    return exercise;
  }

  async update(
    id: string,
    updateExerciseDto: UpdateExerciseDto,
  ): Promise<Exercise> {
    const [exercise, multipleChoiceExercise, trueFalseExercise] =
      await Promise.all([
        this.exerciseModel.findById(id).exec(),
        this.multipleChoiceExerciseModel.findById(id).exec(),
        this.trueFalseExerciseModel.findById(id).exec(),
      ]);

    const foundExercise =
      exercise || multipleChoiceExercise || trueFalseExercise;

    if (!foundExercise) {
      throw new NotFoundException('Exercício não encontrado');
    }
    console.log(foundExercise);
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
    const [exercise, multipleChoiceExercise, trueFalseExercise] =
      await Promise.all([
        this.exerciseModel.findById(id).exec(),
        this.multipleChoiceExerciseModel.findById(id).exec(),
        this.trueFalseExerciseModel.findById(id).exec(),
      ]);

    if (exercise) {
      await this.exerciseModel.findByIdAndDelete(id);
    } else if (multipleChoiceExercise) {
      await this.multipleChoiceExerciseModel.findByIdAndDelete(id);
    } else if (trueFalseExercise) {
      await this.trueFalseExerciseModel.findByIdAndDelete(id);
    } else {
      throw new NotFoundException('Exercício não encontrado');
    }
  }

  async getByUserRole(userPayload: UserPayload): Promise<any> {
    const userRole = userPayload.role;

    if (userRole === 'TEACHER') {
      const [exercises, multipleChoiceExercises, trueFalseExercises] =
        await Promise.all([
          this.exerciseModel.find({ teacher_id: userPayload.id }).exec(),
          this.multipleChoiceExerciseModel
            .find({ teacher_id: userPayload.id })
            .exec(),
          this.trueFalseExerciseModel
            .find({ teacher_id: userPayload.id })
            .exec(),
        ]);

      return [...exercises, ...multipleChoiceExercises, ...trueFalseExercises];
    }
  }

  async finalizeMultipleChoiceExercise(
    userPayload: UserPayload,
    exercise_id: string,
    answer: any,
  ): Promise<any> {
    let exercise = await this.exerciseModel.findById(exercise_id);

    if (!exercise) {
      exercise = await this.multipleChoiceExerciseModel.findById(exercise_id);
    }

    if (!exercise) {
      exercise = await this.trueFalseExerciseModel.findById(exercise_id);
    }

    if (!exercise) {
      throw new NotFoundException('Exercício não encontrado');
    }

    if (!exercise) throw new NotFoundException('Exercício não encontrado');

    console.log('🚀 ~ exercise', exercise);

    await this.verifyMultipleChoiceAnswer({
      exercise_id: exercise.id,
      answer,
    });

    const createUserProgressDto: CreateUserProgressDto = {
      user_id: userPayload.id,
      lesson_plan_id: exercise.lesson_plan_id,
      external_id: exercise.id,
      type: 'EXERCISE',
    };

    const userProgress = await this.userProgressService.create(
      createUserProgressDto,
    );

    return userProgress;
  }

  async verifyMultipleChoiceAnswer(data: {
    exercise_id: string;
    answer: any;
  }): Promise<any> {
    let exercise = await this.exerciseModel.findById(data.exercise_id);

    if (!exercise) {
      exercise = await this.multipleChoiceExerciseModel.findById(
        data.exercise_id,
      );
    }

    if (!exercise) {
      exercise = await this.trueFalseExerciseModel.findById(data.exercise_id);
    }

    if (!exercise) {
      throw new NotFoundException('Exercício não encontrado');
    }

    if (!exercise) throw new NotFoundException('Exercício não encontrado');

    const answer = exercise?.answer;

    if (
      answer !== data.answer &&
      exercise.type === ExerciseType.MULTIPLE_CHOICE
    ) {
      return { points: 0, correct: false };
    }

    return { points: exercise.points, correct: true };
  }

  async teacherCorrection(
    userPayload: UserPayload,
    exercise_id: string,
    data: UpdateUserProgressDto,
  ) {
    const userProgress =
      await this.userProgressService.findOneByExerciseAndUser(
        exercise_id,
        userPayload.id,
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
