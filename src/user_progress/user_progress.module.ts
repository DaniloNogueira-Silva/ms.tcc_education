import { User, UserSchema } from 'src/user/user.schema';
import { UserProgress, UserProgressSchema } from './user_progress.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProgressController } from './user_progress.controller';
import { UserProgressService } from './user_progress.service';
import { UserValidator } from '../utils/user.validator';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserProgress.name, schema: UserProgressSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [UserProgressController],
  providers: [UserProgressService, UserValidator],
  exports: [UserProgressService],
})
export class UserProgressModule {}
