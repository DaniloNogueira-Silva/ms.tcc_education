import { PartialType } from '@nestjs/mapped-types';
import {
  CreateExerciseDto,
  CreateMultipleChoiceExerciseDto,
  CreateTrueFalseExerciseDto,
} from './create-exercise.dto';

export class UpdateExerciseDto extends PartialType(CreateExerciseDto) {}

export class UpdateMultipleChoiceExerciseDto extends PartialType(
  CreateMultipleChoiceExerciseDto,
) {}

export class UpdateTrueFalseExerciseDto extends PartialType(
  CreateTrueFalseExerciseDto,
) {}
