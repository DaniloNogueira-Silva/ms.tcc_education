import { Exercise, ExerciseSchema } from '../exercise/exercise.schema';
import { LessonPlan, LessonPlanSchema } from '../lesson_plan/lesson_plan.schema';
import { User, UserSchema } from './user.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserValidator } from '../utils/user.validator';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, UserValidator],
  exports: [UserService],
})
export class UserModule {}
