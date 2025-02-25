import { LessonPlan, LessonPlanSchema } from './lesson_plan.schema';
import { UserMapProgress, UserMapProgressSchema } from 'src/user_map_progress/user_map_progress.schema';

import { LessonPlanController } from './lesson_plan.controller';
import { LessonPlanService } from './lesson_plan.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserValidator } from 'src/utils/user.validator';

@Module({
    imports: [
      MongooseModule.forFeature([
        { name: UserMapProgress.name, schema: UserMapProgressSchema },
        { name: LessonPlan.name, schema: LessonPlanSchema },
      ]),
    ],
  controllers: [LessonPlanController],
  providers: [LessonPlanService, UserValidator],
})
export class LessonPlanModule {}
