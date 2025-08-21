import { IsString, IsNotEmpty, IsDate, IsOptional } from 'class-validator';

export class CreateLessonPlanContentDto {
  @IsString()
  @IsNotEmpty()
  lesson_plan_id: string;

  @IsString()
  @IsNotEmpty()
  content_id: string;

  @IsString()
  @IsNotEmpty()
  content_type: string;

  @IsDate()
  @IsOptional()
  due_date?: Date;
}
