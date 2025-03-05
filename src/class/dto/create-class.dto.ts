import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateClassDto {
  @IsNotEmpty()
  teacher_id: string;

  @IsNotEmpty()
  lesson_plan_id: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsDate()
  due_date: Date;

  @IsString()
  links: string;

  @IsNotEmpty()
  points: number;

  @IsNotEmpty()
  type: string;
}
