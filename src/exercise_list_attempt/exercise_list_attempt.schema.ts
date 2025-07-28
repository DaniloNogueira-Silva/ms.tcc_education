import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'exercise_list_attempt' })
export class ExerciseListAttempt extends Document {
  @Prop({ required: true, ref: 'user_progress' })
  user_progress_id: string;

  @Prop({ required: true, ref: 'exercise' })
  exercise_id: string;

  @Prop()
  answer: string;

  @Prop()
  grade: number;
}

export const ExerciseListAttemptSchema =
  SchemaFactory.createForClass(ExerciseListAttempt);
