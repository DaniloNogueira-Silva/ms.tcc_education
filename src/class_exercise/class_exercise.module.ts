import { ClassExercise, ClassExerciseSchema } from './class_exercise.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassExerciseController } from './class_exercise.controller';
import { ClassExerciseService } from './class_exercise.service';
import { UserValidator } from '../utils/user.validator';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClassExercise.name, schema: ClassExerciseSchema },
    ]),
  ],
  controllers: [ClassExerciseController],
  providers: [ClassExerciseService, UserValidator],
})
export class ClassExerciseModule {}
