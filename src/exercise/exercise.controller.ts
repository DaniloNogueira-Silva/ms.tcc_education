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
import { ExerciseService } from './exercise.service';
import { UserValidator } from 'src/utils/user.validator';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ActionTypes } from 'src/user/enum/action_types.enum';

@Controller('exercises')
export class ExerciseController {
  constructor(
    private readonly exerciseService: ExerciseService,
    private readonly userValidator: UserValidator,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createExerciseDto: CreateExerciseDto, @Req() req) {
    await this.userValidator.validateAccess(
      req.user,
      ActionTypes.CREATE_EXERCISE,
    );
    return await this.exerciseService.create(createExerciseDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    await this.userValidator.validateAccess(
      req.user,
      ActionTypes.GET_ALL_EXERCISE,
    );
    return await this.exerciseService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user, ActionTypes.GET_EXERCISE);
    return await this.exerciseService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(
      req.user,
      ActionTypes.UPDATE_EXERCISE,
    );
    return await this.exerciseService.update(id, updateExerciseDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(
      req.user,
      ActionTypes.DELETE_EXERCISE,
    );
    return await this.exerciseService.remove(id);
  }
}
