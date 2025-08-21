import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, collection: 'exercise_list' })
export class ExerciseList extends Document {
  @Prop({ required: true })
  teacher_id: string;

  @Prop({ required: true, ref: 'Exercise' })
  exercises_ids: MongooseSchema.Types.ObjectId[];

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  content: string;

  @Prop({ required: true })
  type: string;
}

export const ExerciseListSchema = SchemaFactory.createForClass(ExerciseList);
