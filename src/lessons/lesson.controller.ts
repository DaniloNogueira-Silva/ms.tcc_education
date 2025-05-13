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
import { LessonService } from './lesson.service';
import { UserValidator } from '../utils/user.validator';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { UserPayload } from '../auth/auth.service';

@Controller('lessons')
export class LessonController {
  constructor(
    private readonly lessonService: LessonService,
    private readonly userValidator: UserValidator,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createLessonDto: CreateLessonDto, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.lessonService.create(createLessonDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.lessonService.getByUserRole(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':lessonPlanId/byLessonPlan')
  async findAllByLessonPlan(
    @Param('lessonPlanId') lessonPlanId: string,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.lessonService.findAllByLessonPlan(lessonPlanId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.lessonService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.lessonService.update(id, updateLessonDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.lessonService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':lessonId/mark-completed')
  async markLessonAsCompleted(@Param('lessonId') lessonId: string, @Req() req) {
    return this.lessonService.markLessonAsCompleted(req.user, lessonId);
  }
}
