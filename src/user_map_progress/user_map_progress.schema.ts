import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

export enum ProgressStatus {
  INCOMPLETE = 'EM ANDAMENTO',
  COMPLETED = 'CONCLUÍDO',
}

@Schema({ timestamps: true })
export class UserMapProgress extends Document {
  @Prop({ required: true })
  student_id: string;

  @Prop({ required: true })
  lesson_plan_id: string;

  @Prop({ required: true })
  score: number;

  @Prop({ required: true, enum: ProgressStatus })
  status: string;
}

export const UserMapProgressSchema =
  SchemaFactory.createForClass(UserMapProgress);
