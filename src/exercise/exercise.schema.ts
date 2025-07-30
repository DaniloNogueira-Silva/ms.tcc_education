import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum ExerciseType {
  MULTIPLE_CHOICE = 'multiple_choice',
  OPEN = 'open',
  TRUE_FALSE = 'true_false',
}

export enum ExerciseDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

@Schema()
export class Option {
  @Prop({ required: true })
  statement: string;

  @Prop({ required: true })
  answer: boolean;
}

export const OptionSchema = SchemaFactory.createForClass(Option);

@Schema({ timestamps: true, collection: 'exercises' })
export class Exercise extends Document {
  @Prop({ required: true })
  statement: string;

  @Prop({ required: true, enum: ExerciseType })
  type: ExerciseType;

  @Prop({ required: false })
  answer: string;

  @Prop({ default: false })
  showAnswer: boolean;

  @Prop({ required: false })
  teacher_id: string;

  @Prop({ required: false })
  due_date: Date;

  @Prop({ required: true, enum: ExerciseDifficulty })
  difficulty: ExerciseDifficulty;

  @Prop({ required: false })
  grade: number;

  @Prop({ type: [String], required: false })
  links?: string[];

  @Prop({ type: [String], required: false })
  multiple_choice_options?: string[];

  @Prop({ type: [OptionSchema], required: false })
  true_false_options?: Option[];
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);
