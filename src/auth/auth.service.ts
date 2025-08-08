import {
  Injectable,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
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
  private readonly logger = new Logger(AuthService.name);

  public constructor(
    private jwtService: JwtService,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  public async validateUser(email: string, password: string): Promise<any> {
    this.logger.log(`Validating user with email: ${email}`);
    try {
      const user = await this.userModel
        .findOne({ email })
        .select('+password')
        .exec();
      if (!user) {
        throw new UnauthorizedException('Invalid credentials provided.');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials provided.');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user.toObject();
      return result;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(
        `An unexpected error occurred while validating user ${email}.`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'An error occurred during user validation.',
      );
    }
  }

  public async login(loginDto: LoginDto): Promise<object> {
    const { email, password } = loginDto;
    this.logger.log(`User login attempt for email: ${email}`);
    try {
      const user = await this.validateUser(email, password);

      const payload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      return { access_token: this.jwtService.sign(payload) };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(
        `An unexpected error occurred during login for user ${email}.`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'An error occurred during the login process.',
      );
    }
  }
}
