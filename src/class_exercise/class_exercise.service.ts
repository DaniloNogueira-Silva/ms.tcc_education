import { CreateClassExerciseDto } from './dto/create-class-exercise.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateClassExerciseDto } from './dto/update-class-exercise.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ClassExercise } from './class_exercise.schema';
import { Model } from 'mongoose';

@Injectable()
export class ClassExerciseService {
  constructor(
    @InjectModel(ClassExercise.name)
    private ClassExerciseModel: Model<ClassExercise>,
  ) {}

  async create(
    createClassExerciseDto: CreateClassExerciseDto,
  ): Promise<ClassExercise> {
    const createdClassExercise = new this.ClassExerciseModel(
      createClassExerciseDto,
    );
    return createdClassExercise.save();
  }

  async findAll(): Promise<ClassExercise[]> {
    return this.ClassExerciseModel.find().exec();
  }

  async findOne(id: string): Promise<ClassExercise> {
    const classes = await this.ClassExerciseModel.findById(id);
    if (!classes)
      throw new NotFoundException('Associação exercicio e aula não encontrado');
    return classes;
  }

  async findExercise(exercise_id: string): Promise<boolean> {
    const classExercise = await this.ClassExerciseModel.findOne({
      exercise_id,
    });

    return classExercise !== null;
  }

  async update(
    id: string,
    updateClassExerciseDto: UpdateClassExerciseDto,
  ): Promise<ClassExercise | null> {
    return this.ClassExerciseModel.findOneAndUpdate(
      { _id: id },
      updateClassExerciseDto,
      {
        new: true,
      },
    );
  }

  async remove(id: string): Promise<void> {
    await this.ClassExerciseModel.findByIdAndDelete({ _id: id });
  }
}
