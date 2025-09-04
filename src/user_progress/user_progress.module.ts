import {
  ExerciseList,
  ExerciseListSchema,
} from '../exercise_list/exercise_list.schema';
import { User, UserSchema } from '../user/user.schema';
import { UserProgress, UserProgressSchema } from './user_progress.schema';

import { HttpRequest } from '../utils/http.request';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProgressController } from './user_progress.controller';
import { UserProgressService } from './user_progress.service';
import { UserValidator } from '../utils/user.validator';
import {
  ExerciseListAttempt,
  ExerciseListAttemptSchema,
} from '../exercise_list_attempt/exercise_list_attempt.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserProgress.name, schema: UserProgressSchema },
      { name: User.name, schema: UserSchema },
      { name: ExerciseList.name, schema: ExerciseListSchema },
      { name: ExerciseListAttempt.name, schema: ExerciseListAttemptSchema },
    ]),
  ],
  controllers: [UserProgressController],
  providers: [UserProgressService, UserValidator],
  exports: [UserProgressService],
})
export class UserProgressModule {}
