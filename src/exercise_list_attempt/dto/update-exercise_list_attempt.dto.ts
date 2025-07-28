import { PartialType } from '@nestjs/mapped-types';
import { CreateExerciseListAttemptDto } from './create-exercise_list_attempt.dto';

export class UpdateExerciseListAttemptDto extends PartialType(
  CreateExerciseListAttemptDto,
) {}
