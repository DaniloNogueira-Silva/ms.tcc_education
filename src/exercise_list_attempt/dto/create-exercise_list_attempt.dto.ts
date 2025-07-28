import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateExerciseListAttemptDto {
  @IsNotEmpty()
  user_progress_id: string;

  @IsNotEmpty()
  exercise_id: string;

  @IsString()
  @IsOptional()
  answer?: string;

  @IsNumber()
  @IsOptional()
  grade?: number;
}
