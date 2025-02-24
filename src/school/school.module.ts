import { School, SchoolSchema } from './school.schema';
import { User, UserSchema } from 'src/user/user.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';
import { UserValidator } from '../utils/user.validator';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: School.name, schema: SchoolSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [SchoolController],
  providers: [SchoolService, UserValidator],
})
export class SchoolModule {}
