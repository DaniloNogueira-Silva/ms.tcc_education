import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateLessonPlanDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  icon: string;
}
