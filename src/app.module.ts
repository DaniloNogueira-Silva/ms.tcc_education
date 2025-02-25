import { AuthModule } from './auth/auth.module';
import { ClassExerciseModule } from './class_exercise/class_exercise.module';
import { ClassModule } from './class/class.module';
import { ConfigModule } from '@nestjs/config';
import { LessonPlanModule } from './lesson_plan/lesson_plan.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchoolModule } from './school/school.module';
import { SchoolUserModule } from './school_user/school_user.module';
import { UserMapProgressModule } from './user_map_progress/user_map_progress.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB || ''), 
    AuthModule,
    UserModule,
    SchoolModule,
    SchoolUserModule,
    LessonPlanModule,
    UserMapProgressModule,
    ClassModule,
    ClassExerciseModule
  ],
})
export class AppModule {}
