import { ExerciseList, ExerciseListSchema } from './exercise_list.schema';

import { ExerciseListController } from './exercise_list.controller';
import { ExerciseListService } from './exercise_list.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProgressModule } from '../user_progress/user_progress.module';
import { UserValidator } from '../utils/user.validator';
import { FilesModule } from '../files/files.module';
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
    FilesModule,
    ExerciseModule,
    ExerciseListAttemptModule,
  ],
  controllers: [ExerciseListController],
  providers: [ExerciseListService, UserValidator],
})
export class ExerciseListModule {}
