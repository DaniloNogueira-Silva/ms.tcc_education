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

  @IsNotEmpty()
  @IsString()
  lesson_plan_id: string;

  @IsArray()
  @IsString({ each: true })
  exercises: string[];

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsDate()
  @IsOptional()
  due_date: Date;

  @IsNumber()
  @IsOptional()
  points: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  links?: string[];

  @IsNotEmpty()
  type: string;
}
