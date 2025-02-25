import { IsNotEmpty } from "class-validator";

export class CreateLessonPlanDto {
  @IsNotEmpty()
  teacher_id: string;

  @IsNotEmpty()
  name: string;
  
  @IsNotEmpty()
  theme: string;
}
