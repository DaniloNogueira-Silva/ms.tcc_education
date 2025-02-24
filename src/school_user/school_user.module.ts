import { SchoolUser, SchoolUserSchema } from './school_user.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchoolUserController } from './school_user.controller';
import { SchoolUserService } from './school_user.service';
import { UserValidator } from '../utils/user.validator';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SchoolUser.name, schema: SchoolUserSchema },
    ]),
  ],
  controllers: [SchoolUserController],
  providers: [SchoolUserService, UserValidator],
})
export class SchoolUserModule {}
