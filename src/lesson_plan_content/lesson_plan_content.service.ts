import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { LessonPlanContent } from './lesson_plan_content.schema';
import { CreateLessonPlanContentDto } from './dto/create-lesson_plan_content.dto';
import { UpdateLessonPlanContentDto } from './dto/update-lesson_plan_content.dto';

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

  async findOneByContent(
    content_id: string,
    content_type: string,
  ): Promise<LessonPlanContent | null> {
    return this.lessonPlanContentModel
      .findOne({
        content_id,
        content_type,
      })
      .exec();
  }

  async getContentIdsByLessonPlan(lesson_plan_id: string): Promise<string[]> {
    const contents = await this.lessonPlanContentModel
      .find({ lesson_plan_id })
      .exec();
    return contents.map((c) => c.content_id);
  }

  async getContentsByLessonPlan(
    lessonPlanId: string,
  ): Promise<LessonPlanContent[]> {
    return this.lessonPlanContentModel
      .find({ lesson_plan_id: lessonPlanId })
      .exec();
  }

  async getAssociationsByContent(
    content_id: string,
    content_type: string,
  ): Promise<LessonPlanContent[]> {
    return this.lessonPlanContentModel
      .find({
        content_id,
        content_type,
      })
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

  async update(
    id: string,
    updateLessonPlanContentDto: UpdateLessonPlanContentDto,
  ): Promise<LessonPlanContent> {
    const updatedLessonPlanContent =
      await this.lessonPlanContentModel.findByIdAndUpdate(
        id,
        updateLessonPlanContentDto,
        { new: true },
      );

    if (!updatedLessonPlanContent) {
      throw new NotFoundException('Associação não encontrada para atualização');
    }

    return updatedLessonPlanContent;
  }

  async remove(id: string): Promise<void> {
    const result = await this.lessonPlanContentModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException('Associação não encontrada para remoção');
    }
  }

  async removeAllAssociationsByContentId(
    content_id: string,
    content_type: string,
  ): Promise<void> {
    const result = await this.lessonPlanContentModel.deleteMany({
      content_id,
      content_type,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Nenhuma associação encontrada para remoção');
    }
  }
}
