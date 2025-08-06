import {
  ExerciseListAttempt,
  ExerciseListAttemptSchema,
} from './exercise_list_attempt.schema';

import { ConfigService } from '@nestjs/config';
import { ExerciseListAttemptController } from './exercise_list-attempt.controller';
import { ExerciseListAttemptService } from './exercise_list_attempt.service';
import { HttpRequest } from '../utils/http.request';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProgressModule } from '../user_progress/user_progress.module';
import { UserValidator } from '../utils/user.validator';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExerciseListAttempt.name, schema: ExerciseListAttemptSchema },
    ]),
    UserProgressModule,
  ],
  controllers: [ExerciseListAttemptController],
  providers: [ExerciseListAttemptService, UserValidator, ConfigService, HttpRequest],
  exports: [ExerciseListAttemptService],
})
export class ExerciseListAttemptModule {}
