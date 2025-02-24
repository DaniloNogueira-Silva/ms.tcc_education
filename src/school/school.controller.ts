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
import { SchoolService } from './school.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserValidator } from '../utils/user.validator';
import { ActionTypes } from 'src/user/enum/action_types.enum';

@Controller('school')
@UseGuards(JwtAuthGuard)
export class SchoolController {
  constructor(
    private readonly schoolService: SchoolService,
    private readonly userValidator: UserValidator,
  ) {}

  @Post()
  async create(@Body() dto, @Req() req) {
    await this.userValidator.validateAccess(
      req.user,
      ActionTypes.CREATE_SCHOOL,
    );

    return this.schoolService.create(dto);
  }

  @Get()
  async findAll(@Req() req) {
    await this.userValidator.validateAccess(
      req.user,
      ActionTypes.CREATE_SCHOOL,
    );

    return this.schoolService.getCompaniesByRole(req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(
      req.user,
      ActionTypes.CREATE_SCHOOL,
    );

    return this.schoolService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto, @Req() req) {
    await this.userValidator.validateAccess(
      req.user,
      ActionTypes.CREATE_SCHOOL,
    );

    return this.schoolService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(
      req.user,
      ActionTypes.CREATE_SCHOOL,
    );

    return this.schoolService.remove(id);
  }
}
