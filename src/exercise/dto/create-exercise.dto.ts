import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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
  @Type(() => OptionDto)
  options: OptionDto[];
}
