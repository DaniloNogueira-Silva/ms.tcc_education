import { CreateExerciseListDto } from './create-exercise_list.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateExerciseListDto extends PartialType(CreateExerciseListDto) {}
