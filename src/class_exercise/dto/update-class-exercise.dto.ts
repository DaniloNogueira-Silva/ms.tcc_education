import { CreateClassExerciseDto } from './create-class-exercise.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateClassExerciseDto extends PartialType(
  CreateClassExerciseDto,
) {}
