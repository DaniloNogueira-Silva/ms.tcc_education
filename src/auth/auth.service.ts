import { Injectable, UnauthorizedException, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/user/user.schema';
import { School } from 'src/school/school.schema';

export interface UserPayload {
  access_token: string;
  id: string;
  name: string;
  email: string;
  role: string;
  school_id?: string;
  permissions: string[];
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,

    @InjectModel(User.name)
    private userModel: Model<User>,

    @InjectModel(School.name)
    private schoolModel: Model<School>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Usuário inexistente');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Credenciais inválidas');

    return user;
  }

  async login(loginDto: LoginDto): Promise<string> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const school = await this.schoolModel.findOne({ manager_id: user._id });

    const payload = {
      _id: user._id, // ✅ Mantendo o _id como no payload original do JWT
      name: user.name,
      email: user.email,
      role: user.role,
      school_id: school ? school._id : null,
    };

    return this.jwtService.sign(payload);
  }
}
