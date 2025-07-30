import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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

  @IsDate()
  @IsOptional()
  due_date?: Date;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  links?: string[];

  @IsNotEmpty()
  @IsString()
  type: string;
}
