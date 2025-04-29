import { AppController } from './test.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ExerciseModule } from './exercise/exercise.module';
import { LessonPlanModule } from './lesson_plan/lesson_plan.module';
import { LessonsModule } from './lessons/lessons.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQProducerService } from './utils/rabbitmq-producer';
import { UserModule } from './user/user.module';
import { UserProgressModule } from './user_progress/user.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB || ''), 
    AuthModule,
    UserModule,
    LessonPlanModule,
    LessonsModule,
    ExerciseModule,
    UserProgressModule
  ],
  controllers: [AppController],
  providers: [RabbitMQProducerService],
})
export class AppModule {}
