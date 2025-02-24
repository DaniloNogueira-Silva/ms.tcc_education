import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    return await this.authService.login(loginDto, res);
  }

  @Get('payload')
  async getUserFromCookies(@Req() req: Request, @Res() res: Response) {
    const authToken = req.cookies['auth_token'];
    const userPayloadEncoded = req.cookies['user_payload'];

    if (!authToken || !userPayloadEncoded) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    const user = await this.authService.getUserFromCookies(
      authToken,
      userPayloadEncoded,
    );
    return res.json(user);
  }
  F;
}
