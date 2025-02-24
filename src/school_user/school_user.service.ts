import { CreateSchoolUserDto } from './dto/create-school-user.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateSchoolUserDto } from './dto/update-school-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SchoolUser } from './school_user.schema';
import { Model } from 'mongoose';

@Injectable()
export class SchoolUserService {
  constructor(
    @InjectModel(SchoolUser.name)
    private schoolUserModel: Model<SchoolUser>,
  ) {}

  async create(
    createSchoolUserDto: CreateSchoolUserDto,
  ): Promise<SchoolUser> {
    const createdSchoolUser = new this.schoolUserModel(createSchoolUserDto);
    return createdSchoolUser.save();
  }

  async findAll(): Promise<SchoolUser[]> {
    return this.schoolUserModel.find().exec();
  }

  async findOne(id: string): Promise<SchoolUser> {
    const school = await this.schoolUserModel.findById(id);
    if (!school) throw new NotFoundException('Usuário da empresa não encontrado');
    return school;
  }

  async update(
    id: string,
    updateSchoolUserDto: UpdateSchoolUserDto,
  ): Promise<SchoolUser | null> {
    return this.schoolUserModel.findOneAndUpdate(
      { _id: id },
      updateSchoolUserDto,
      {
        new: true,
      },
    );
  }

  async remove(id: string): Promise<void> {
    await this.schoolUserModel.findByIdAndDelete({ _id: id });
  }
}
