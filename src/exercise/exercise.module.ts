import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Exercise,
  ExerciseSchema,
  MultipleChoiceExercise,
  MultipleChoiceExerciseSchema,
  TrueFalseExercise,
  TrueFalseExerciseSchema,
} from './exercise.schema';
import { ExerciseService } from './exercise.service';
import { ExerciseController } from './exercise.controller';
import { UserValidator } from 'src/utils/user.validator';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exercise.name, schema: ExerciseSchema },
      {
        name: MultipleChoiceExercise.name,
        schema: MultipleChoiceExerciseSchema,
      },
      { name: TrueFalseExercise.name, schema: TrueFalseExerciseSchema },
    ]),
  ],
  controllers: [ExerciseController],
  providers: [ExerciseService, UserValidator],
})
export class ExerciseModule {}
