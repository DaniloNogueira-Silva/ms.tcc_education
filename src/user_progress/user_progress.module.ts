import { UserProgress, UserProgressSchema } from './user_progress.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserValidator } from '../utils/user.validator';
import { UserProgressService } from './user_progress.service';
import { UserProgressController } from './user_progress.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserProgress.name, schema: UserProgressSchema },
    ]),
  ],
  controllers: [UserProgressController],
  providers: [UserProgressService, UserValidator],
  exports: [UserProgressService],
})
export class UserProgressModule {}
