import { Exercise, ExerciseSchema } from './exercise.schema';
import { Module, forwardRef } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { ExerciseController } from './exercise.controller';
import { ExerciseListModule } from '../exercise_list/exercise_list.module';
import { ExerciseService } from './exercise.service';
import { HttpRequest } from '../utils/http.request';
import { LessonPlanContentModule } from '../lesson_plan_content/lesson_plan_content.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProgressModule } from '../user_progress/user_progress.module';
import { UserValidator } from '../utils/user.validator';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exercise.name, schema: ExerciseSchema },
    ]),
    UserProgressModule,
    LessonPlanContentModule,
    forwardRef(() => ExerciseListModule),
  ],
  controllers: [ExerciseController],
  providers: [ExerciseService, UserValidator, HttpRequest, ConfigService],
  exports: [ExerciseService],
})
export class ExerciseModule {}
