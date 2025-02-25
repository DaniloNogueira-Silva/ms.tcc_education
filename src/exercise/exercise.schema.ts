import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  OPEN = 'open',
  TRUE_FALSE = 'true_false',
}

@Schema({ timestamps: true, discriminatorKey: 'type' })
export class Question extends Document {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true, enum: QuestionType })
  type: QuestionType;

  @Prop({ required: true })
  answer: string;

  @Prop({ default: false })
  showAnswer: boolean;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema()
export class MultipleChoiceQuestion extends Question {
  @Prop({ type: [String], required: true })
  options: string[];
}

export const MultipleChoiceQuestionSchema = SchemaFactory.createForClass(
  MultipleChoiceQuestion,
);

@Schema()
export class Option {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  answer: boolean;
}

export const OptionSchema = SchemaFactory.createForClass(Option);

@Schema()
export class TrueFalseQuestion extends Question {
  @Prop({ type: [OptionSchema], default: [] })
  options: Option[];
}

export const TrueFalseQuestionSchema =
  SchemaFactory.createForClass(TrueFalseQuestion);
