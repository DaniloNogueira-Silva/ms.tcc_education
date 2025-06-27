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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExerciseService } from './exercise.service';
import { UserValidator } from '../utils/user.validator';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { UpdateUserProgressDto } from 'src/user_progress/dto/update-user_progress.dto';
import { CreateUserProgressDto } from 'src/user_progress/dto/create-user_progress.dto';
import { FilesService } from '../files/files.service';

@Controller('exercises')
export class ExerciseController {
  constructor(
    private readonly exerciseService: ExerciseService,
    private readonly userValidator: UserValidator,
    private readonly filesService: FilesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      dest: './uploads',
    }),
  )
  async create(
    @Body() createExerciseDto: CreateExerciseDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    if (file) {
      this.filesService.ensureUploadDir();
      createExerciseDto.links = createExerciseDto.links || [];
      createExerciseDto.links.push(`/files/${file.filename}`);
    }
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
  @Get(':exercise_id/completed')
  async isCompleted(@Param('exercise_id') exercise_id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    const completed = await this.exerciseService.isCompletedByUser(
      exercise_id,
      req.user.id,
    );
    const deadlinePassed =
      await this.exerciseService.isDeadlinePassed(exercise_id);
    return { completed, deadlinePassed };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.exerciseService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateExerciseAndLessonPlans(
    @Param('id') id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.exerciseService.updateExerciseAndLessonPlans(
      id,
      updateExerciseDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.exerciseService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':exerciseId/submitAnswer')
  async submitAnswer(
    @Param('exerciseId') exerciseId: string,
    @Req() req,
    @Body() createUserProgressDto: CreateUserProgressDto,
  ) {
    await this.userValidator.validateAccess(req.user);
    return this.exerciseService.submitAnswer(
      req.user,
      exerciseId,
      createUserProgressDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':exerciseId/teacher-correction')
  async teacherCorrection(
    @Param('exerciseId') exerciseId: string,
    @Req() req,
    @Body() updateUserProgressDto: UpdateUserProgressDto,
  ) {
    await this.userValidator.validateAccess(req.user);
    return this.exerciseService.teacherCorrection(
      exerciseId,
      updateUserProgressDto,
    );
  }
}
