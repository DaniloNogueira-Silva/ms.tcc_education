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
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);

@Schema()
export class MultipleChoiceExercise extends Exercise {
  @Prop({ type: [String], required: true })
  options: string[];
}

export const MultipleChoiceExerciseSchema = SchemaFactory.createForClass(
  MultipleChoiceExercise,
);

@Schema()
export class Option {
  @Prop({ required: true })
  statement: string;

  @Prop({ required: true })
  answer: boolean;
}

export const OptionSchema = SchemaFactory.createForClass(Option);

@Schema()
export class TrueFalseExercise extends Exercise {
  @Prop({ type: [OptionSchema], default: [] })
  options: Option[];
}

export const TrueFalseExerciseSchema =
  SchemaFactory.createForClass(TrueFalseExercise);
