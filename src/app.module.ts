import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchoolModule } from './school/school.module';
import { SchoolUserModule } from './school_user/school_user.module';
import { UserModule } from './user/user.module';
import { LessonPlanModule } from './lesson_plan/lesson_plan.module';
import { UserMapProgressModule } from './user_map_progress/user_map_progress.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB || ''), 
    AuthModule,
    UserModule,
    SchoolModule,
    SchoolUserModule,
    LessonPlanModule,
    UserMapProgressModule
  ],
})
export class AppModule {}
