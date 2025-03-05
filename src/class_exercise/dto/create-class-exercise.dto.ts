import { IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateClassExerciseDto {
  @IsNotEmpty()
  exercise_id: ObjectId;

  @IsNotEmpty()
  class_id: ObjectId;
}
