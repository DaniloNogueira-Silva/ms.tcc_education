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
@Controller('exerciselists')
export class ExerciseListController {
  constructor(
    private readonly exerciselistService: ExerciseListService,
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
  async markExerciseListAsCompleted(
    @Param('exerciselistId') exerciselistId: string,
    @Req() req,
  ) {
    return this.exerciselistService.markExerciseListAsCompleted(
      req.user,
      exerciselistId,
    );
  }
}
