import { PartialType } from '@nestjs/mapped-types';
import { CreateUserMapProgressDto } from './create-user_map_progress.dto';

export class UpdateUserMapProgressDto extends PartialType(CreateUserMapProgressDto) {}
