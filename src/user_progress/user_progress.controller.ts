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
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserProgressService } from './user_progress.service';
import { UserValidator } from 'src/utils/user.validator';
import { UpdateUserProgressDto } from './dto/update-user_progress.dto';
import { CreateUserProgressDto } from 'src/user_progress/dto/create-user_progress.dto';

@Controller('user-progress')
export class UserProgressController {
  constructor(
    private readonly userProgressService: UserProgressService,
    private readonly userValidator: UserValidator,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createUserProgressDto: CreateUserProgressDto,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.userProgressService.create(createUserProgressDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.userProgressService.getByUserRole(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.userProgressService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserProgressDto: UpdateUserProgressDto,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.userProgressService.update(id, updateUserProgressDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.userProgressService.remove(id);
  }
}
