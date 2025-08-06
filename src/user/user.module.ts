import { Exercise, ExerciseSchema } from '../exercise/exercise.schema';
import { Lesson, LessonSchema } from 'src/lessons/lesson.schema';
import {
  LessonPlan,
  LessonPlanSchema,
} from '../lesson_plan/lesson_plan.schema';
import { User, UserSchema } from './user.schema';
import {
  UserProgress,
  UserProgressSchema,
} from 'src/user_progress/user_progress.schema';

import { ConfigService } from '@nestjs/config';
import { HttpRequest } from 'src/utils/http.request';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserValidator } from '../utils/user.validator';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Exercise.name, schema: ExerciseSchema },
      { name: LessonPlan.name, schema: LessonPlanSchema },
      { name: UserProgress.name, schema: UserProgressSchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, UserValidator, HttpRequest, ConfigService],
  exports: [UserService],
})
export class UserModule {}
