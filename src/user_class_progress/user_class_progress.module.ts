import { Class, ClassSchema } from 'src/class/class.schema';
import {
  UserClassProgress,
  UserClassProgressSchema,
} from './user_class_progress.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserClassProgressController } from './user_class_progress.controller';
import { UserClassProgressService } from './user_class_progress.service';
import { UserValidator } from 'src/utils/user.validator';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserClassProgress.name, schema: UserClassProgressSchema },
      { name: Class.name, schema: ClassSchema },
    ]),
  ],
  controllers: [UserClassProgressController],
  providers: [UserClassProgressService, UserValidator],
})
export class UserClassProgressModule {}
