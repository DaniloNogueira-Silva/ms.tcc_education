import { UserProgress, UserProgressSchema } from './user.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserValidator } from '../utils/user.validator';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserProgress.name, schema: UserProgressSchema },
    ]),
  ],
  controllers: [],
  providers: [UserValidator],
  exports: [],
})
export class UserProgressModule {}
