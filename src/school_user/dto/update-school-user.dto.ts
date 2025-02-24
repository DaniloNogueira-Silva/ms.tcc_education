import { CreateSchoolUserDto } from './create-school-user.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateSchoolUserDto extends PartialType(CreateSchoolUserDto) {}
