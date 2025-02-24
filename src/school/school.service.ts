import { CreateSchoolDto } from './dto/create-school.dto';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { InjectModel } from '@nestjs/mongoose';
import { School } from './school.schema';
import { Model } from 'mongoose';
import { User } from 'src/user/user.schema';
import { UserPayload } from 'src/auth/auth.service';

@Injectable()
export class SchoolService {
  constructor(
    @InjectModel(School.name)
    private schoolModel: Model<School>,

    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async create(createSchoolDto: CreateSchoolDto): Promise<School> {
    const user = await this.userModel.findById(createSchoolDto.manager_id);
    if (!user) throw new NotFoundException('Empresa não encontrado');

    if (user.role !== 'ADMIN') throw new Error('Usuário não possui permissão.');

    const createdSchool = new this.schoolModel(createSchoolDto);
    return createdSchool.save();
  }

  async findAll(): Promise<School[]> {
    return this.schoolModel.find().exec();
  }

  async findOne(id: string): Promise<School> {
    const school = await this.schoolModel.findById(id);
    if (!school) throw new NotFoundException('Empresa não encontrado');
    return school;
  }

  async update(
    id: string,
    updateSchoolDto: UpdateSchoolDto,
  ): Promise<School | null> {
    return this.schoolModel.findOneAndUpdate({ _id: id }, updateSchoolDto, {
      new: true,
    });
  }

  async remove(id: string): Promise<void> {
    await this.schoolModel.findByIdAndDelete({ _id: id });
  }

  async getCompaniesByRole(userPayload: UserPayload): Promise<any> {
    const userRole = userPayload.role;
    const userSchool = userPayload?.school_id;

    if (userRole === 'MASTER') {
      return await this.schoolModel.find().exec();
    }

    if (userRole === 'ADMIN' || userRole === 'DEFAULT') {
      return await this.schoolModel.find({ id: userSchool }).exec();
    }
  }
}
