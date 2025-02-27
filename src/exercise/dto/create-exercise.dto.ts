import {
  IsArray,
  IsBoolean,
  IsEnum,
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

  @IsString()
  teacher_id: string;

  @IsBoolean()
  @IsOptional()
  showAnswer?: boolean;
}

export class CreateMultipleChoiceExerciseDto extends CreateExerciseDto {
  @IsArray()
  @IsString({ each: true })
  options: string[];
}

export class OptionDto {
  @IsString()
  statement: string;

  @IsBoolean()
  answer: boolean;
}

export class CreateTrueFalseExerciseDto extends CreateExerciseDto {
  @IsArray()
  @ValidateNested({ each: true })
  options: OptionDto[];
}
