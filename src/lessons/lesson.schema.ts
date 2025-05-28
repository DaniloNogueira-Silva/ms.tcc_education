import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

export enum LessonType {
  READING = 'reading',
  SCHOOL_WORK = 'school_work',
}

@Schema({ timestamps: true })
export class Lesson extends Document {
  @Prop({ required: true })
  teacher_id: string;

  @Prop({ required: true, enum: LessonType })
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
