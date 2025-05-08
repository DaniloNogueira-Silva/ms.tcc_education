import { Injectable, UnauthorizedException, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/user.schema';

export interface UserPayload {
  access_token: string;
  id: string;
  name: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,

    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Usuário inexistente');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Credenciais inválidas');

    return user;
  }

  async login(loginDto: LoginDto): Promise<object> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return { access_token: this.jwtService.sign(payload) };
  }
}
