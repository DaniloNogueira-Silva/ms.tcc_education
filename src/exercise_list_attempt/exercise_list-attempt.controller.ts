import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExerciseListAttemptService } from './exercise_list_attempt.service';
import { CreateExerciseListAttemptDto } from './dto/create-exercise_list_attempt.dto';
import { UpdateExerciseListAttemptDto } from './dto/update-exercise_list_attempt.dto';
import { UserValidator } from '../utils/user.validator';

@UseGuards(JwtAuthGuard)
@Controller('exercise-list-attempts')
export class ExerciseListAttemptController {
  constructor(
    private readonly attemptService: ExerciseListAttemptService,
    private readonly userValidator: UserValidator,
  ) {}

  @Post()
  async create(@Body() createDto: CreateExerciseListAttemptDto, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return this.attemptService.create(createDto);
  }

  @Get('user-progress/:user_progress_id')
  async findByUserProgress(
    @Param('user_progress_id') user_progress_id: string,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return this.attemptService.findByUserProgress(user_progress_id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateExerciseListAttemptDto,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return this.attemptService.update(id, updateDto);
  }

  @Patch(':id/grade')
  async gradeAttempt(
    @Param('id') id: string,
    @Body('grade') grade: number,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return this.attemptService.gradeAttempt(id, grade);
  }
}
