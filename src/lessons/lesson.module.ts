import { Lesson, LessonSchema } from './lesson.schema';

import { ConfigService } from '@nestjs/config';
import { HttpRequest } from 'src/utils/http.request';
import { LessonController } from './lesson.controller';
import { LessonPlanContentModule } from 'src/lesson_plan_content/lesson_plan_content.module';
import { LessonService } from './lesson.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProgressModule } from '../user_progress/user_progress.module';
import { UserValidator } from '../utils/user.validator';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lesson.name, schema: LessonSchema }]),
    UserProgressModule,
    LessonPlanContentModule,
  ],
  controllers: [LessonController],
  providers: [LessonService, UserValidator, HttpRequest, ConfigService],
})
export class LessonModule {}
