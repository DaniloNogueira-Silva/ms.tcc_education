import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SchoolUser extends Document {
  @Prop({ required: true })
  school_id: string;
  @Prop({ required: true })
  user_id: string;
}

export const SchoolUserSchema = SchemaFactory.createForClass(SchoolUser);
