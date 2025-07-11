import {
  IsArray,
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
  name: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsDate()
  @IsOptional()
  due_date: Date;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  links?: string[];

  @IsNumber()
  @IsOptional()
  points: number;

  @IsNotEmpty()
  type: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  lesson_plan_ids?: string[];
}
