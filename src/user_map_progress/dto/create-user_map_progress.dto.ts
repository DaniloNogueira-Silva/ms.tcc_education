import { IsNotEmpty } from 'class-validator';

export class CreateUserMapProgressDto {
  @IsNotEmpty()
  student_id: string;

  @IsNotEmpty()
  lesson_plan_id: string;
}
