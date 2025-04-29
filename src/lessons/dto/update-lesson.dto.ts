import { CreateLessonDto } from './create-lesson.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateLessonDto extends PartialType(CreateLessonDto) {}
