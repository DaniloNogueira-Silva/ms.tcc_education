import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Lesson extends Document {
  @Prop({ required: true })
  teacher_id: string;

  @Prop({ required: true })
  lesson_plan_id: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: false })
  due_date: Date;

  @Prop({ required: false })
  links: string[];

  @Prop({ required: false })
  points: number;

  @Prop({ required: false })
  grade: number;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
