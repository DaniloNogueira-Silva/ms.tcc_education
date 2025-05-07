import {
  Exercise,
  ExerciseSchema,
  MultipleChoiceExercise,
  MultipleChoiceExerciseSchema,
  TrueFalseExercise,
  TrueFalseExerciseSchema,
} from './exercise.schema';

import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProgressModule } from '../user_progress/user_progress.module';
import { UserValidator } from '../utils/user.validator';

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
    UserProgressModule,
  ],
  controllers: [ExerciseController],
  providers: [ExerciseService, UserValidator],
})
export class ExerciseModule {}
