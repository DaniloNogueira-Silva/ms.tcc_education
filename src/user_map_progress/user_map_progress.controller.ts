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
import { UserMapProgressService } from './user_map_progress.service';
import { UserValidator } from 'src/utils/user.validator';
import { CreateUserMapProgressDto } from './dto/create-user_map_progress.dto';
import { UpdateUserMapProgressDto } from './dto/update-user_map_progress.dto';
import { ActionTypes } from 'src/user/enum/action_types.enum';

@Controller('user-map-progresss')
export class UserMapProgressController {
  constructor(
    private readonly usermapprogressService: UserMapProgressService,
    private readonly userValidator: UserValidator,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createUserMapProgressDto: CreateUserMapProgressDto, @Req() req) {
    await this.userValidator.validateAccess(
      req.user,
      ActionTypes.CREATE_USER_MAP_PROGRESS,
    );
    return await this.usermapprogressService.create(createUserMapProgressDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    await this.userValidator.validateAccess(
      req.user,
      ActionTypes.GET_ALL_USER_MAP_PROGRESS,
    );
    return await this.usermapprogressService.getByUserRole(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(
      req.user,
      ActionTypes.GET_USER_MAP_PROGRESS,
    );
    return await this.usermapprogressService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserMapProgressDto: UpdateUserMapProgressDto,
    @Req() req,
  ) {
    await this.userValidator.validateAccess(
      req.user,
      ActionTypes.UPDATE_USER_MAP_PROGRESS,
    );
    return await this.usermapprogressService.update(id, updateUserMapProgressDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(
      req.user,
      ActionTypes.DELETE_USER_MAP_PROGRESS,
    );
    return await this.usermapprogressService.remove(id);
  }
}
