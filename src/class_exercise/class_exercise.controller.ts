import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ClassExerciseService } from './class_exercise.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserValidator } from '../utils/user.validator';
import { ActionTypes } from 'src/user/enum/action_types.enum';

@Controller('class-exercise')
@UseGuards(JwtAuthGuard)
export class ClassExerciseController {
  constructor(
    private readonly classExerciseService: ClassExerciseService,
    private readonly userValidator: UserValidator,
  ) {}

  @Post()
  async create(@Body() dto, @Req() req) {
    await this.userValidator.validateAccess(req.user, ActionTypes.CREATE_CLASSES);

    return this.classExerciseService.create(dto);
  }

  @Get()
  async findAll(@Req() req) {
    await this.userValidator.validateAccess(req.user, ActionTypes.CREATE_CLASSES);

    return this.classExerciseService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user, ActionTypes.CREATE_CLASSES);

    return this.classExerciseService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto, @Req() req) {
    await this.userValidator.validateAccess(req.user, ActionTypes.CREATE_CLASSES);

    return this.classExerciseService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user, ActionTypes.CREATE_CLASSES);

    return this.classExerciseService.remove(id);
  }
}
