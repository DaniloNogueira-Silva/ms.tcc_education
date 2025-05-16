import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.schema';
import { UserPayload } from '../auth/auth.service';
import { LessonPlan } from '../lesson_plan/lesson_plan.schema';
import { Exercise } from '../exercise/exercise.schema';
import axios from 'axios';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    const user = await createdUser.save();

    await axios.post(
      'http://localhost:3003/user-character/user-character',
      {
        user_id: user.id,
        name: user.name,
        level: 1,
        points: 0,
        rank: 'BRONZE',
        trophies: [],
        avatar_id: ""
      },
    );

    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
  }

  async remove(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id);
  }

  async getByUserRole(userPayload: UserPayload): Promise<any> {
    const userRole = userPayload.role;

    if (userRole === 'STUDENT' || userRole === 'TEACHER') {
      return await this.userModel.findById(userPayload.id).exec();
    }
  }
}
