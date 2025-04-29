import { Exercise, ExerciseSchema } from 'src/exercise/exercise.schema';
import { LessonPlan, LessonPlanSchema } from 'src/lesson_plan/lesson_plan.schema';
import { User, UserSchema } from './user.schema';
import { UserProgress, UserProgressSchema } from 'src/user_progress/user.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserValidator } from '../utils/user.validator';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: LessonPlan.name, schema: LessonPlanSchema },
      { name: Exercise.name, schema: ExerciseSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, UserValidator],
  exports: [UserService],
})
export class UserModule {}
