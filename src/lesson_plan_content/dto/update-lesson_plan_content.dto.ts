import { CreateLessonPlanContentDto } from './create-lesson_plan_content.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateLessonPlanContentDto extends PartialType(
  CreateLessonPlanContentDto,
) {}
