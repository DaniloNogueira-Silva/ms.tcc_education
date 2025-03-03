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
import { LessonPlanService } from './lesson_plan.service';
import { UserValidator } from 'src/utils/user.validator';
import { CreateLessonPlanDto } from './dto/create-lesson_plan.dto';
import { UpdateLessonPlanDto } from './dto/update-lesson_plan.dto';
import { ActionTypes } from 'src/user/enum/action_types.enum';

@Controller('lesson-plans')
export class LessonPlanController {
  constructor(
    private readonly lessonplanService: LessonPlanService,
    private readonly userValidator: UserValidator,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createLessonPlanDto: CreateLessonPlanDto, @Req() req) {
    await this.userValidator.validateAccess(
      req.user,
      ActionTypes.CREATE_LESSON_PLAN,
    );
    return await this.lessonplanService.create(createLessonPlanDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    await this.userValidator.validateAccess(
      req.user,
      ActionTypes.GET_ALL_LESSON_PLAN,
    );
    return await this.lessonplanService.getByUserRole(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(
      req.user,
      ActionTypes.GET_LESSON_PLAN,
    );
    return await this.lessonplanService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLessonPlanDto: UpdateLessonPlanDto,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(
      req.user,
      ActionTypes.UPDATE_LESSON_PLAN,
    );
    return await this.lessonplanService.update(id, updateLessonPlanDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(
      req.user,
      ActionTypes.DELETE_LESSON_PLAN,
    );
    return await this.lessonplanService.remove(id);
  }
}
