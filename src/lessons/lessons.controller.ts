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
import { LessonsService } from './lessons.service';
import { UserValidator } from 'src/utils/user.validator';
import { CreateLessonsDto } from './dto/create-lessons.dto';
import { UpdateLessonsDto } from './dto/update-lessons.dto';


@Controller('classes')
export class LessonsController {
  constructor(
    private readonly classService: LessonsService,
    private readonly userValidator: UserValidator,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createLessonsDto: CreateLessonsDto, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.classService.create(createLessonsDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.classService.getByUserRole(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.classService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLessonsDto: UpdateLessonsDto,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.classService.update(id, updateLessonsDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.classService.remove(id);
  }
}
