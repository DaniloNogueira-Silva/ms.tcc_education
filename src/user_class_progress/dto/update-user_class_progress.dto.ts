import { CreateUserClassProgressDto } from './create-user_class_progress.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateUserClassProgressDto extends PartialType(CreateUserClassProgressDto) {}
