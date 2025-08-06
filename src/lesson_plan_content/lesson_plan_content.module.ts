import {
  LessonPlanContent,
  LessonPlanContentSchema,
} from './lesson_plan_content.schema';

import { HttpRequest } from 'src/utils/http.request';
import { LessonPlanContentController } from './lesson_plan_content.controller';
import { LessonPlanContentService } from './lesson_plan_content.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserValidator } from 'src/utils/user.validator';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LessonPlanContent.name, schema: LessonPlanContentSchema },
    ]),
  ],
  controllers: [LessonPlanContentController],
  providers: [LessonPlanContentService, UserValidator],
  exports: [LessonPlanContentService],
})
export class LessonPlanContentModule {}
