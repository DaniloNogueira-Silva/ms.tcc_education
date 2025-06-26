import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ExerciseListModule } from './exercise_list/exercise_list.module';
import { ExerciseModule } from './exercise/exercise.module';
import { LessonModule } from './lessons/lesson.module';
import { LessonPlanModule } from './lesson_plan/lesson_plan.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { UserProgressModule } from './user_progress/user_progress.module';
import { LessonPlanContentModule } from './lesson_plan_content/lesson_plan_content.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB || ''),
    AuthModule,
    UserModule,
    LessonPlanModule,
    LessonModule,
    ExerciseModule,
    UserProgressModule,
    ExerciseListModule,
    LessonPlanContentModule,
    FilesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
