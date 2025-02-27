import { Exercise, ExerciseSchema } from 'src/exercise/exercise.schema';
import { LessonPlan, LessonPlanSchema } from 'src/lesson_plan/lesson_plan.schema';
import { User, UserSchema } from './user.schema';
import { UserMapProgress, UserMapProgressSchema } from 'src/user_map_progress/user_map_progress.schema';

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
      { name: UserMapProgress.name, schema: UserMapProgressSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, UserValidator],
  exports: [UserService],
})
export class UserModule {}
