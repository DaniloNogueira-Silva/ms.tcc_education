import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserClassProgressDto {
  @IsNotEmpty()
  student_id: string;

  @IsNotEmpty()
  class_id: string;

  @IsNotEmpty()
  score: number;

  @IsNotEmpty()
  is_finished: false;

  @IsOptional()
  completion_date: Date;
}
