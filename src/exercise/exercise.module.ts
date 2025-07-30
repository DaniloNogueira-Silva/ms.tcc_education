import { Exercise, ExerciseSchema } from './exercise.schema';
import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProgressModule } from '../user_progress/user_progress.module';
import { UserValidator } from '../utils/user.validator';
import { LessonPlanContentModule } from 'src/lesson_plan_content/lesson_plan_content.module';
import { FilesModule } from '../files/files.module';
import { ExerciseListModule } from 'src/exercise_list/exercise_list.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exercise.name, schema: ExerciseSchema },
    ]),
    UserProgressModule,
    LessonPlanContentModule,
    forwardRef(() => ExerciseListModule),
    FilesModule,
  ],
  controllers: [ExerciseController],
  providers: [ExerciseService, UserValidator],
  exports: [ExerciseService],
})
export class ExerciseModule {}
