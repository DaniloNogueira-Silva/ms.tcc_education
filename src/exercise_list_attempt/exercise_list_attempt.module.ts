import {
  ExerciseListAttempt,
  ExerciseListAttemptSchema,
} from './exercise_list_attempt.schema';

import { ConfigService } from '@nestjs/config';
import { ExerciseListAttemptController } from './exercise_list-attempt.controller';
import { ExerciseListAttemptService } from './exercise_list_attempt.service';
import { HttpRequest } from '../utils/http.request';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProgressModule } from '../user_progress/user_progress.module';
import { UserValidator } from '../utils/user.validator';
import { ExerciseModule } from 'src/exercise/exercise.module';
import { ExerciseListModule } from 'src/exercise_list/exercise_list.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExerciseListAttempt.name, schema: ExerciseListAttemptSchema },
    ]),
    UserProgressModule,
    forwardRef(() => ExerciseModule),
    forwardRef(() => ExerciseListModule),
  ],
  controllers: [ExerciseListAttemptController],
  providers: [
    ExerciseListAttemptService,
    UserValidator,
    ConfigService,
    HttpRequest,
  ],
  exports: [ExerciseListAttemptService],
})
export class ExerciseListAttemptModule {}
