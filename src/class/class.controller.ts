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
import { ClassService } from './class.service';
import { UserValidator } from 'src/utils/user.validator';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ActionTypes } from 'src/user/enum/action_types.enum';

@Controller('classes')
export class ClassController {
  constructor(
    private readonly classService: ClassService,
    private readonly userValidator: UserValidator,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createClassDto: CreateClassDto, @Req() req) {
    await this.userValidator.validateAccess(req.user, ActionTypes.CREATE_CLASSES);
    return await this.classService.create(createClassDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    await this.userValidator.validateAccess(
      req.user,
      ActionTypes.GET_ALL_CLASSES,
    );
    return await this.classService.getByUserRole(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user, ActionTypes.GET_CLASSES);
    return await this.classService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(req.user, ActionTypes.UPDATE_CLASSES);
    return await this.classService.update(id, updateClassDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user, ActionTypes.DELETE_CLASSES);
    return await this.classService.remove(id);
  }
}
