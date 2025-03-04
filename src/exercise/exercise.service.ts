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
import { UserPayload } from 'src/auth/auth.service';

@Injectable()
export class ExerciseService {
  constructor(
    @InjectModel(Exercise.name)
    private exerciseModel: Model<Exercise>,
    @InjectModel(MultipleChoiceExercise.name)
    private multipleChoiceExerciseModel: Model<MultipleChoiceExercise>,
    @InjectModel(TrueFalseExercise.name)
    private trueFalseExerciseModel: Model<TrueFalseExercise>,
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

  async findAll(): Promise<Exercise[]> {
    const [exercises, multipleChoiceExercises, trueFalseExercises] =
      await Promise.all([
        this.exerciseModel.find().exec(),
        this.multipleChoiceExerciseModel.find().exec(),
        this.trueFalseExerciseModel.find().exec(),
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
    const exercise = await this.exerciseModel.findById(id);
    if (!exercise) throw new NotFoundException('Exercício não encontrado');

    if (updateExerciseDto.type && updateExerciseDto.type !== exercise.type) {
      throw new BadRequestException(
        'Não é possível alterar o tipo do exercício.',
      );
    }

    Object.assign(exercise, updateExerciseDto);
    return exercise.save();
  }

  async remove(id: string): Promise<void> {
    await this.exerciseModel.findByIdAndDelete(id);
  }

  async getByUserRole(userPayload: UserPayload): Promise<any> {
    const userRole = userPayload.role;

    if (userRole === 'STUDENT' || userRole === 'TEACHER') {
      return await this.exerciseModel.findById(userPayload.id).exec();
    }
  }
}
