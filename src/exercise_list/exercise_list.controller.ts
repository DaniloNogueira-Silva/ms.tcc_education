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
import { UserValidator } from '../utils/user.validator';
import { ExerciseListService } from './exercise_list.service';
import { CreateExerciseListDto } from './dto/create-exercise_list.dto';
import { UpdateExerciseListDto } from './dto/update-exercise_list.dto';
import { FilesService } from '../files/files.service';

@UseGuards(JwtAuthGuard)
@Controller('exercise_lists')
export class ExerciseListController {
  constructor(
    private readonly exerciseListService: ExerciseListService,
    private readonly userValidator: UserValidator,
    private readonly filesService: FilesService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      dest: './uploads',
    }),
  )
  async create(
    @Body() createExerciseListDto: CreateExerciseListDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    if (file) {
      this.filesService.ensureUploadDir();
      createExerciseListDto.links = createExerciseListDto.links || [];
      createExerciseListDto.links.push(`/files/${file.filename}`);
    }
    return await this.exerciseListService.create(createExerciseListDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.exerciseListService.getByUserRole(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':lessonPlanId/byLessonPlan')
  async findAllByLessonPlan(
    @Param('lessonPlanId') lessonPlanId: string,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.exerciseListService.findAllByLessonPlan(lessonPlanId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':exercise_list_id/completed')
  async isCompleted(
    @Param('exercise_list_id') exercise_list_id: string,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    const completed = await this.exerciseListService.isCompletedByUser(
      exercise_list_id,
      req.user.id,
    );
    const deadlinePassed =
      await this.exerciseListService.isDeadlinePassed(exercise_list_id);
    return { completed, deadlinePassed };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.exerciseListService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateExerciseListAndLessonPlans(
    @Param('id') id: string,
    @Body() updateExerciseListDto: UpdateExerciseListDto,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.exerciseListService.updateExerciseListAndLessonPlans(
      id,
      updateExerciseListDto,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.exerciseListService.remove(id);
  }

  @Post(':exerciselistId/mark-completed')
  async markExerciseListAsCompleted(
    @Param('exerciselistId') exerciselistId: string,
    @Req() req,
  ) {
    return this.exerciseListService.markExerciseListAsCompleted(
      req.user,
      exerciselistId,
    );
  }
}
