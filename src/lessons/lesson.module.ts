import { Lesson, LessonSchema } from './lesson.schema';

import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserValidator } from 'src/utils/user.validator';
import { UserProgressModule } from 'src/user_progress/user_progress.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lesson.name, schema: LessonSchema }]),
    UserProgressModule,
  ],
  controllers: [LessonController],
  providers: [LessonService, UserValidator],
})
export class LessonModule {}
