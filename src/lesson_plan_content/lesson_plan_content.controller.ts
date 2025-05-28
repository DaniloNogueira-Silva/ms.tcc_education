import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  UseGuards,
  Req,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LessonPlanContentService } from './lesson_plan_content.service';
import { UserValidator } from '../utils/user.validator';
import { CreateLessonPlanContentDto } from './dto/create-lesson_plan_content.dto';

@Controller('lesson-plan-contents')
export class LessonPlanContentController {
  constructor(
    private readonly lessonPlanContentService: LessonPlanContentService,
    private readonly userValidator: UserValidator,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req,
    @Body() createLessonPlanContentDto: CreateLessonPlanContentDto,
  ) {
    await this.userValidator.validateAccess(req.user);

    return this.lessonPlanContentService.create(createLessonPlanContentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    await this.userValidator.validateAccess(req.user);
    return await this.lessonPlanContentService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-plan/:lessonPlanId')
  async getContentsByPlan(
    @Req() req,
    @Param('lessonPlanId') lessonPlanId: string,
  ) {
    await this.userValidator.validateAccess(req.user);

    return this.lessonPlanContentService.getContentsByLessonPlan(lessonPlanId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('exists')
  async checkExists(
    @Req() req,
    @Query('lessonPlanId') lessonPlanId: string,
    @Query('contentId') contentId: string,
    @Query('contentType') contentType: string,
  ) {
    await this.userValidator.validateAccess(req.user);

    if (!lessonPlanId || !contentId || !contentType) {
      throw new BadRequestException(
        'Parâmetros lessonPlanId, contentId e contentType são obrigatórios',
      );
    }

    const exists =
      await this.lessonPlanContentService.checkIfContentExistsInPlan(
        lessonPlanId,
        contentId,
        contentType,
      );

    return { exists };
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async remove(@Param('id') id: string, @Req() req) {
    await this.userValidator.validateAccess(req.user);

    return await this.lessonPlanContentService.remove(id);
  }
}
