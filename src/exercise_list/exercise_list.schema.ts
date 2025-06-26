import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'exercise_list' })
export class ExerciseList extends Document {
  @Prop({ required: true })
  teacher_id: string;

  @Prop({ required: false })
  lesson_plan_id: string;

  @Prop({ required: true })
  exercises: string[];

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  content: string;

  @Prop({ required: false })
  due_date: Date;

  @Prop({ required: false })
  points: number;

  @Prop({ type: [String], required: false })
  links?: string[];

  @Prop({ required: true })
  type: string; //  TEST or LIST
}

export const ExerciseListSchema = SchemaFactory.createForClass(ExerciseList);
