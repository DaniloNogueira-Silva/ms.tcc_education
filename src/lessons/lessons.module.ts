import { Lessons, LessonsSchema } from './lessons.schema';

import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserValidator } from 'src/utils/user.validator';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lessons.name, schema: LessonsSchema }]),
  ],
  controllers: [LessonsController],
  providers: [LessonsService, UserValidator],
})
export class LessonsModule {}
