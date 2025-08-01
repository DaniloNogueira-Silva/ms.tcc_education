import { ExerciseList, ExerciseListSchema } from './exercise_list.schema';

import { ExerciseListController } from './exercise_list.controller';
import { ExerciseListService } from './exercise_list.service';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProgressModule } from '../user_progress/user_progress.module';
import { UserValidator } from '../utils/user.validator';
import { LessonPlanContentModule } from 'src/lesson_plan_content/lesson_plan_content.module';
import { ExerciseModule } from 'src/exercise/exercise.module';
import { ExerciseListAttemptModule } from '../exercise_list_attempt/exercise_list_attempt.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExerciseList.name, schema: ExerciseListSchema },
    ]),
    UserProgressModule,
    LessonPlanContentModule,
    forwardRef(() => ExerciseModule),
    ExerciseListAttemptModule,
  ],
  controllers: [ExerciseListController],
  providers: [ExerciseListService, UserValidator],
  exports: [ExerciseListService],
})
export class ExerciseListModule {}
