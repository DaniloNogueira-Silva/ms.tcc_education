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
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserProgressService } from './user_progress.service';
import { UserValidator } from '../utils/user.validator';
import { UpdateUserProgressDto } from './dto/update-user_progress.dto';
import { CreateUserProgressDto } from '../user_progress/dto/create-user_progress.dto';

@UseGuards(JwtAuthGuard)
@Controller('user-progress')
export class UserProgressController {
  constructor(
    private readonly userProgressService: UserProgressService,
    private readonly userValidator: UserValidator,
  ) {}

  @Post()
  async create(
    @Body() createUserProgressDto: CreateUserProgressDto,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.userProgressService.create(createUserProgressDto);
  }

  @Get()
  async findAll(@Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.userProgressService.getByUserRole(req.user);
  }

  @Get('ranking/:lessonPlanId')
  async findUserProgressByLessonPlanId(
    @Param('lessonPlanId') lessonPlanId: string,
  ) {
    return await this.userProgressService.findTotalPointsByUser(lessonPlanId);
  }

  @Get('exercise/:exerciseId')
  async findAllStudentsByExerciseId(
    @Param('exerciseId') exerciseId: string,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.userProgressService.findAllStudentsByExerciseId(
      exerciseId,
    );
  }

  @Get('exercise_list/:exercise_list_id')
  async findAllStudentsByExerciseListId(
    @Param('exercise_list_id') exercise_list_id: string,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.userProgressService.findAllStudentsByExerciseListId(
      exercise_list_id,
    );
  }

  @Get('exercise_list_answers/:exercise_list_id')
  async findStudentsAnswersByExerciseListId(
    @Param('exercise_list_id') exercise_list_id: string,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.userProgressService.findStudentsAnswersByExerciseListId(
      exercise_list_id,
    );
  }

  @Get('lesson/:lesson_id')
  async findAllStudentsByLessonId(
    @Param('lesson_id') lesson_id: string,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.userProgressService.findAllStudentsByLessonId(lesson_id);
  }

  @Get('lesson_plan/:lesson_plan_id')
  async findAllStudentsByLessonPlanId(
    @Param('lesson_plan_id') lesson_plan_id: string,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.userProgressService.findAllStudentsByLessonPlanId(
      lesson_plan_id,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.userProgressService.findOne(id);
  }

  @Get('lesson/:lesson_id/user/:user_id')
  async findOneByLessonAndUser(
    @Param('lesson_id') lesson_id: string,
    @Param('user_id') user_id: string,
    @Query('type') type: string,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.userProgressService.findOneByLessonAndUser(
      lesson_id,
      user_id,
      type,
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserProgressDto: UpdateUserProgressDto,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.userProgressService.update(id, updateUserProgressDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.userProgressService.remove(id);
  }

  @Get(':externalId/:type')
  async findUserProgressByLessonIdAndUserId(
    @Param('externalId') externalId: string,
    @Param('type') type: string,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.userProgressService.findByLessonPlanAndType(
      externalId,
      type,
    );
  }
}
