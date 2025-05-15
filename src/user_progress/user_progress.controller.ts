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

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.userProgressService.findOne(id);
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
