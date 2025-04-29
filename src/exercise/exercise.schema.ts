import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

export enum ExerciseType {
  MULTIPLE_CHOICE = 'multiple_choice',
  OPEN = 'open',
  TRUE_FALSE = 'true_false',
}

@Schema({ timestamps: true, discriminatorKey: 'type', collection: 'exercises' })
export class Exercise extends Document {
  @Prop({ required: true })
  statement: string;

  @Prop({ required: true, enum: ExerciseType })
  type: ExerciseType;

  @Prop({ required: true })
  answer: string;

  @Prop({ default: false })
  showAnswer: boolean;

  @Prop({ required: false })
  teacher_id: string;

  @Prop({ required: false })
  due_date: Date;

  @Prop({ required: false })
  points: number;

  @Prop({ required: false })
  grade: number;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);

@Schema({ collection: 'multiple_choice_exercises' })
export class MultipleChoiceExercise extends Exercise {
  @Prop({ type: [String], required: true })
  options: string[];
}

export const MultipleChoiceExerciseSchema = SchemaFactory.createForClass(
  MultipleChoiceExercise,
);

@Schema({ collection: 'option_exercises' })
export class Option {
  @Prop({ required: true })
  statement: string;

  @Prop({ required: true })
  answer: boolean;
}

export const OptionSchema = SchemaFactory.createForClass(Option);

@Schema({ collection: 'true_false_exercises' })
export class TrueFalseExercise extends Exercise {
  @Prop({ type: [OptionSchema], default: [] })
  options: Option[];
}

export const TrueFalseExerciseSchema =
  SchemaFactory.createForClass(TrueFalseExercise);
