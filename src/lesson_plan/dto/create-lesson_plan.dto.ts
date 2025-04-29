import { IsNotEmpty } from "class-validator";

export class CreateLessonPlanDto {
  @IsNotEmpty()
  name: string;
}
