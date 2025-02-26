import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class UserClassProgress extends Document {
  @Prop({ required: true })
  student_id: string;

  @Prop({ required: true })
  class_id: string;

  @Prop({ required: true })
  score: number;

  @Prop({ required: true })
  is_finished: boolean;

  @Prop({ required: true })
  completion_date: Date;
}

export const UserClassProgressSchema =
  SchemaFactory.createForClass(UserClassProgress);
