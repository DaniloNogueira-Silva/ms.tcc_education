import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserValidator } from '../utils/user.validator';
import { ActionTypes } from './enum/action_types.enum';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userValidator: UserValidator,
  ) {}

  @UseGuards()
  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Req() req) {
    return await this.userService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    await this.userValidator.validateAccess(req.user, ActionTypes.GET_ALL_USER);
    return await this.userService.getByUserRole(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user, ActionTypes.GET_USER);
    return await this.userService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user, ActionTypes.UPDATE_USER);
    return await this.userService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user, ActionTypes.DELETE_USER);
    return await this.userService.remove(id);
  }
}
