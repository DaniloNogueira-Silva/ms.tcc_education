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
import { ExerciseService } from './exercise.service';
import { UserValidator } from '../utils/user.validator';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { UpdateUserProgressDto } from 'src/user_progress/dto/update-user_progress.dto';

@Controller('exercises')
export class ExerciseController {
  constructor(
    private readonly exerciseService: ExerciseService,
    private readonly userValidator: UserValidator,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createExerciseDto: CreateExerciseDto, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.exerciseService.create(createExerciseDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.exerciseService.getByUserRole(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':lessonPlanId/byLessonPlan')
  async findAllByLessonPlan(
    @Param('lessonPlanId') lessonPlanId: string,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.exerciseService.findAllByLessonPlan(lessonPlanId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.exerciseService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.exerciseService.update(id, updateExerciseDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.exerciseService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':exerciseId/submitAnswer')
  async markExerciseAsCompleted(
    @Param('exerciseId') exerciseId: string,
    @Req() req,
    @Body() updateUserProgressDto: UpdateUserProgressDto,
  ) {
    return this.exerciseService.submitAnswer(
      req.user,
      exerciseId,
      updateUserProgressDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':exerciseId/teacher-correction')
  async teacherCorrection(
    @Param('exerciseId') exerciseId: string,
    @Req() req,
    @Body() updateExerciseDto: UpdateExerciseDto,
  ) {
    return this.exerciseService.teacherCorrection(
      req.user,
      exerciseId,
      updateExerciseDto,
    );
  }
}
