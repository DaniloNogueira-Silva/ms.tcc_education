import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ClassExercise extends Document {
  @Prop({ required: true })
  class_id: string;
  @Prop({ required: true })
  exercise_id: string;
}

export const ClassExerciseSchema = SchemaFactory.createForClass(ClassExercise);
