import { ExerciseList, ExerciseListSchema } from './exercise_list.schema';

import { ExerciseListController } from './exercise_list.controller';
import { ExerciseListService } from './exercise_list.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExerciseList.name, schema: ExerciseListSchema },
    ]),
  ],
  controllers: [ExerciseListController],
  providers: [ExerciseListService],
})
export class ExerciseListModule {}
