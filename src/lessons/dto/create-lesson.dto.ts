import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLessonDto {
  @IsNotEmpty()
  @IsString()
  teacher_id: string;

  @IsNotEmpty()
  @IsString()
  lesson_plan_id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsDate()
  @IsOptional()
  due_date: Date;

  @IsString()
  @IsOptional()
  links: string[];

  @IsNumber()
  @IsOptional()
  points: number;

  @IsNotEmpty()
  type: string;
}
