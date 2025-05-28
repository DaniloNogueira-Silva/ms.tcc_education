import { Exercise, ExerciseSchema } from './exercise.schema';
import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProgressModule } from '../user_progress/user_progress.module';
import { UserValidator } from '../utils/user.validator';
import {
  LessonPlanContent,
  LessonPlanContentSchema,
} from 'src/lesson_plan_content/lesson_plan_content.schema';
import { LessonPlanContentModule } from 'src/lesson_plan_content/lesson_plan_content.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exercise.name, schema: ExerciseSchema },
      { name: LessonPlanContent.name, schema: LessonPlanContentSchema },
    ]),
    UserProgressModule,
    LessonPlanContentModule,
  ],
  controllers: [ExerciseController],
  providers: [ExerciseService, UserValidator],
})
export class ExerciseModule {}
