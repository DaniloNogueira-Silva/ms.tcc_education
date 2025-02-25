import { Class, ClassSchema } from './class.schema';

import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserValidator } from 'src/utils/user.validator';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Class.name, schema: ClassSchema }]),
  ],
  controllers: [ClassController],
  providers: [ClassService, UserValidator],
})
export class ClassModule {}
