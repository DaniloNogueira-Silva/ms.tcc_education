import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonPlanDto } from './create-lesson_plan.dto';

export class UpdateLessonPlanDto extends PartialType(CreateLessonPlanDto) {}
