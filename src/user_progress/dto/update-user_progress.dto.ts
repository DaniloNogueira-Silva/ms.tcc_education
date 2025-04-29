import { PartialType } from '@nestjs/mapped-types';
import { CreateUserProgressDto } from './create-user_progress.dto';

export class UpdateUserProgressDto extends PartialType(CreateUserProgressDto) {}
