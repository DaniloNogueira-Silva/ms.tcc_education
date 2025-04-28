import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { Document } from "mongoose";

@Schema({ timestamps: true })
export class LessonPlan extends Document {

    @Prop({ required: true })
    teacher_id: string;

    @Prop({ required: true })
    name: string;
}

export const LessonPlanSchema = SchemaFactory.createForClass(LessonPlan);