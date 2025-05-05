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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LessonPlanService } from './lesson_plan.service';
import { UserValidator } from '../utils/user.validator';
import { CreateLessonPlanDto } from './dto/create-lesson_plan.dto';
import { UpdateLessonPlanDto } from './dto/update-lesson_plan.dto';
import { CreateUserProgressDto } from '../user_progress/dto/create-user_progress.dto';

@Controller('lesson-plans')
export class LessonPlanController {
  constructor(
    private readonly lessonplanService: LessonPlanService,
    private readonly userValidator: UserValidator,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createLessonPlanDto: CreateLessonPlanDto, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.lessonplanService.create(createLessonPlanDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.lessonplanService.getByUserRole(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.lessonplanService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLessonPlanDto: UpdateLessonPlanDto,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.lessonplanService.update(id, updateLessonPlanDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.lessonplanService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('inviteUser')
  async inviteUser(
    @Body() createUserProgressDto: CreateUserProgressDto,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.lessonplanService.inviteUser(createUserProgressDto);
  }
}
