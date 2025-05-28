import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum ExerciseType {
  MULTIPLE_CHOICE = 'multiple_choice',
  OPEN = 'open',
  TRUE_FALSE = 'true_false',
}

export class CreateExerciseDto {
  @IsString()
  statement: string;

  @IsEnum(ExerciseType)
  type: ExerciseType;

  @IsString()
  answer: string;

  @IsBoolean()
  @IsOptional()
  showAnswer?: boolean;

  @IsString()
  teacher_id: string;

  @IsDate()
  @IsOptional()
  due_date?: Date;

  @IsNumber()
  @IsOptional()
  points?: number;

  @IsNumber()
  @IsOptional()
  grade?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  multiple_choice_options?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  true_false_options?: OptionDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  lesson_plan_ids?: string[];
}

export class OptionDto {
  @IsString()
  statement: string;

  @IsBoolean()
  answer: boolean;
}
