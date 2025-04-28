import { AppController } from './test.controller';
import { AuthModule } from './auth/auth.module';
import { ClassModule } from './class/class.module';
import { ConfigModule } from '@nestjs/config';
import { ExerciseModule } from './exercise/exercise.module';
import { LessonPlanModule } from './lesson_plan/lesson_plan.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQProducerService } from './utils/rabbitmq-producer';
import { UserClassProgressModule } from './user_class_progress/user_class_progress.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB || ''), 
    AuthModule,
    UserModule,
    LessonPlanModule,
    ClassModule,
    ExerciseModule,
    UserClassProgressModule
  ],
  controllers: [AppController],
  providers: [RabbitMQProducerService],
})
export class AppModule {}
