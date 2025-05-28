import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { LessonPlanContent } from './lesson_plan_content.schema';
import { CreateLessonPlanContentDto } from './dto/create-lesson_plan_content.dto';

@Injectable()
export class LessonPlanContentService {
  constructor(
    @InjectModel(LessonPlanContent.name)
    private readonly lessonPlanContentModel: Model<LessonPlanContent>,
  ) {}

  async create(
    createLessonPlanContentDto: CreateLessonPlanContentDto,
  ): Promise<LessonPlanContent> {
    const { lesson_plan_id, content_id, content_type } =
      createLessonPlanContentDto;

    const exists = await this.lessonPlanContentModel.findOne({
      lesson_plan_id,
      content_id,
      content_type,
    });

    if (exists) {
      throw new BadRequestException(
        'Conteúdo já associado a este plano de aula',
      );
    }

    const createdLessonPlanContent = new this.lessonPlanContentModel({
      ...createLessonPlanContentDto,
    });

    return createdLessonPlanContent.save();
  }

  async findAll(): Promise<LessonPlanContent[]> {
    return this.lessonPlanContentModel.find().exec();
  }

  async getContentsByLessonPlan(
    lessonPlanId: string,
  ): Promise<LessonPlanContent[]> {
    return this.lessonPlanContentModel
      .find({ lesson_plan_id: lessonPlanId })
      .exec();
  }

  async checkIfContentExistsInPlan(
    lessonPlanId: string,
    contentId: string,
    contentType: string,
  ): Promise<boolean> {
    const exists = await this.lessonPlanContentModel.findOne({
      lesson_plan_id: lessonPlanId,
      content_id: contentId,
      content_type: contentType,
    });

    return !!exists;
  }

  async remove(lessonPlanContentId: string): Promise<void> {
    const result = await this.lessonPlanContentModel.findOneAndDelete({
      id: lessonPlanContentId,
    });

    if (!result) {
      throw new NotFoundException('Associação não encontrada para remoção');
    }
  }
}
