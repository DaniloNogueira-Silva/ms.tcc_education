import { LessonPlan, LessonPlanSchema } from 'src/lesson_plan/lesson_plan.schema';
import {
  UserMapProgress,
  UserMapProgressSchema,
} from './user_map_progress.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserMapProgressController } from './user_map_progress.controller';
import { UserMapProgressService } from './user_map_progress.service';
import { UserValidator } from 'src/utils/user.validator';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserMapProgress.name, schema: UserMapProgressSchema },
      { name: LessonPlan.name, schema: LessonPlanSchema },
    ]),
  ],
  controllers: [UserMapProgressController],
  providers: [UserMapProgressService, UserValidator],
})
export class UserMapProgressModule {}
