import { Lesson, LessonSchema } from './lesson.schema';

import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProgressModule } from '../user_progress/user_progress.module';
import { UserValidator } from '../utils/user.validator';
import { LessonPlanContentModule } from 'src/lesson_plan_content/lesson_plan_content.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lesson.name, schema: LessonSchema }]),
    UserProgressModule,
    LessonPlanContentModule,
    FilesModule,
  ],
  controllers: [LessonController],
  providers: [LessonService, UserValidator],
})
export class LessonModule {}
