import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateExerciseListDto {
  @IsNotEmpty()
  @IsString()
  teacher_id: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  lesson_plan_ids?: string[];

  @IsArray()
  @IsString({ each: true })
  exercises_ids: string[];

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  content?: string;

  @IsNotEmpty()
  @IsString()
  type: string;
}
