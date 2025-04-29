import { LessonPlan, LessonPlanSchema } from './lesson_plan.schema';
import { UserProgress, UserProgressSchema } from 'src/user_progress/user.schema';

import { LessonPlanController } from './lesson_plan.controller';
import { LessonPlanService } from './lesson_plan.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserValidator } from 'src/utils/user.validator';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LessonPlan.name, schema: LessonPlanSchema },
      { name: UserProgress.name, schema: UserProgressSchema },
    ]),
  ],
  controllers: [LessonPlanController],
  providers: [LessonPlanService, UserValidator],
})
export class LessonPlanModule {}
