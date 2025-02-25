import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Class extends Document {
  @Prop({ required: true })
  teacher_id: string;

  @Prop({ required: true })
  lesson_plan_id: string;

  @Prop({ required: false })
  exercise_id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  due_date: Date;

  @Prop({ required: false })
  links: string;

  @Prop({ required: true })
  points: number;

  @Prop({ required: true })
  type: string;
}

export const ClassSchema = SchemaFactory.createForClass(Class);
