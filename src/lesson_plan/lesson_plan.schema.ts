import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { Document } from "mongoose";

@Schema({ timestamps: true, collection: 'lesson_plan' })
export class LessonPlan extends Document {

    @Prop({ required: true })
    teacher_id: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: false })
    icon: string;
}

export const LessonPlanSchema = SchemaFactory.createForClass(LessonPlan);