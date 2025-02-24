import { IsNotEmpty } from 'class-validator';

export class CreateSchoolUserDto {
  @IsNotEmpty()
  user_id: string;

  @IsNotEmpty()
  school_id: string;
}
