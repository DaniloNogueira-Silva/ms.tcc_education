import { IsNotEmpty } from 'class-validator';

export class CreateClassExerciseDto {
  @IsNotEmpty()
  exercise_id: string;

  @IsNotEmpty()
  class_id: string;
}
