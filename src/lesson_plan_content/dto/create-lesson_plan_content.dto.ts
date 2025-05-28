import { IsString, IsNotEmpty } from 'class-validator';

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
}
