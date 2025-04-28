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
import { UserClassProgressService } from './user_class_progress.service';
import { UserValidator } from 'src/utils/user.validator';
import { CreateUserClassProgressDto } from './dto/create-user_class_progress.dto';
import { UpdateUserClassProgressDto } from './dto/update-user_class_progress.dto';


@Controller('user-map-progresss')
export class UserClassProgressController {
  constructor(
    private readonly userclassprogressService: UserClassProgressService,
    private readonly userValidator: UserValidator,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createUserClassProgressDto: CreateUserClassProgressDto,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.userclassprogressService.create(
      createUserClassProgressDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.userclassprogressService.getByUserRole(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.userclassprogressService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserClassProgressDto: UpdateUserClassProgressDto,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.userclassprogressService.update(
      id,
      updateUserClassProgressDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.userclassprogressService.remove(id);
  }
}
