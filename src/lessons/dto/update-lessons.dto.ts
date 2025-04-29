import { CreateLessonsDto } from './create-lessons.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateLessonsDto extends PartialType(CreateLessonsDto) {}
