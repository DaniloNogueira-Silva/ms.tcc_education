import { ExerciseList, ExerciseListSchema } from './exercise_list.schema';
import { Module, forwardRef } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { ExerciseListAttemptModule } from '../exercise_list_attempt/exercise_list_attempt.module';
import { ExerciseListController } from './exercise_list.controller';
import { ExerciseListService } from './exercise_list.service';
import { ExerciseModule } from '../exercise/exercise.module';
import { HttpRequest } from '../utils/http.request';
import { LessonPlanContentModule } from '../lesson_plan_content/lesson_plan_content.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProgressModule } from '../user_progress/user_progress.module';
import { UserValidator } from '../utils/user.validator';

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
  providers: [ExerciseListService, UserValidator, ConfigService, HttpRequest],
  exports: [ExerciseListService],
})
export class ExerciseListModule {}
