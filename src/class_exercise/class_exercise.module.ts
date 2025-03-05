import { ClassExercise, ClassExerciseSchema } from './class_exercise.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassExerciseController } from './class_exercise.controller';
import { ClassExerciseService } from './class_exercise.service';
import { UserValidator } from '../utils/user.validator';
import { Class, ClassSchema } from 'src/class/class.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClassExercise.name, schema: ClassExerciseSchema },
      { name: Class.name, schema: ClassSchema },
    ]),
  ],
  controllers: [ClassExerciseController],
  providers: [ClassExerciseService, UserValidator],
})
export class ClassExerciseModule {}
