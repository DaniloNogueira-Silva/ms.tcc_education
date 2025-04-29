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
import { UserValidator } from 'src/utils/user.validator';
import { ExerciseListService } from './exercise_list.service';
import { CreateExerciseListDto } from './dto/create-exercise_list.dto';
import { UpdateExerciseListDto } from './dto/update-exercise_list.dto';

@UseGuards(JwtAuthGuard)
@Controller('exerciselists')
export class ExerciseListController {
  constructor(
    private readonly exerciselistService: ExerciseListService,
    private readonly userValidator: UserValidator,
  ) {}

  @Post()
  async create(@Body() createExerciseListDto: CreateExerciseListDto, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.exerciselistService.create(createExerciseListDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.exerciselistService.getByUserRole(req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.exerciselistService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateExerciseListDto: UpdateExerciseListDto,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user);
    return await this.exerciselistService.update(id, updateExerciseListDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.exerciselistService.remove(id);
  }

  @Post(':exerciselistId/mark-completed')
  async markExerciseListAsCompleted(@Param('exerciselistId') exerciselistId: string, @Req() req) {
    return this.exerciselistService.markExerciseListAsCompleted(req.user, exerciselistId);
  }
}
