import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'lesson_plan_content' })
export class LessonPlanContent extends Document {
  @Prop({ required: true })
  content_id: string;

  @Prop({ required: true })
  content_type: string;

  @Prop({ required: true })
  lesson_plan_id: string;

  @Prop({ required: false })
  due_date?: Date;
}

export const LessonPlanContentSchema =
  SchemaFactory.createForClass(LessonPlanContent);
