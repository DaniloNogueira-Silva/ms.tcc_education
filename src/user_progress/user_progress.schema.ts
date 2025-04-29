import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'user_progress' })
export class UserProgress extends Document {
  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  lesson_plan_id: string;

  @Prop({ required: false })
  external_id: string;

  @Prop({ required: false })
  type: string;

  @Prop({ required: false })
  points: number;

  @Prop({ required: false })
  final_grade: number;
}

export const UserProgressSchema = SchemaFactory.createForClass(UserProgress);
