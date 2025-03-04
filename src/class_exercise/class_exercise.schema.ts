import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ClassExercise extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Class', required: true })
  class_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Exercise', required: true })
  exercise_id: Types.ObjectId;
}

export const ClassExerciseSchema = SchemaFactory.createForClass(ClassExercise);
