import {
  Exercise,
  ExerciseSchema,
  MultipleChoiceExercise,
  MultipleChoiceExerciseSchema,
  TrueFalseExercise,
  TrueFalseExerciseSchema,
} from 'src/exercise/exercise.schema';
import {
  ExerciseList,
  ExerciseListSchema,
} from 'src/exercise_list/exercise_list.schema';
import { Lesson, LessonSchema } from 'src/lessons/lesson.schema';
import { LessonPlan, LessonPlanSchema } from './lesson_plan.schema';
import { User, UserSchema } from 'src/user/user.schema';
import {
  UserProgress,
  UserProgressSchema,
} from '../user_progress/user_progress.schema';

import { LessonPlanController } from './lesson_plan.controller';
import { LessonPlanService } from './lesson_plan.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProgressModule } from '../user_progress/user_progress.module';
import { UserValidator } from '../utils/user.validator';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LessonPlan.name, schema: LessonPlanSchema },
      { name: UserProgress.name, schema: UserProgressSchema },
      { name: User.name, schema: UserSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Exercise.name, schema: ExerciseSchema },
      { name: ExerciseList.name, schema: ExerciseListSchema },
      {
        name: MultipleChoiceExercise.name,
        schema: MultipleChoiceExerciseSchema,
      },
      { name: TrueFalseExercise.name, schema: TrueFalseExerciseSchema },
    ]),
    UserProgressModule,
  ],
  controllers: [LessonPlanController],
  providers: [LessonPlanService, UserValidator],
})
export class LessonPlanModule {}
