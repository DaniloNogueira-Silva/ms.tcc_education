import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUserProgressDto {
  @IsNotEmpty()
  user_id: string;

  @IsNotEmpty()
  lesson_plan_id: string;

  @IsString()
  @IsOptional()
  external_id?: string;

  @IsString()
  @IsOptional()
  answer?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  file_path?: string;

  @IsNumber()
  @IsOptional()
  points?: number;

  @IsNumber()
  @IsOptional()
  final_grade?: number;

  @IsNumber()
  @IsOptional()
  coins?: number;
}
