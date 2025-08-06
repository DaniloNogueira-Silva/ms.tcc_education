import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LessonPlanContent } from './lesson_plan_content.schema';
import { CreateLessonPlanContentDto } from './dto/create-lesson_plan_content.dto';
import { UpdateLessonPlanContentDto } from './dto/update-lesson_plan_content.dto';

@Injectable()
export class LessonPlanContentService {
  private readonly logger = new Logger(LessonPlanContentService.name);

  public constructor(
    @InjectModel(LessonPlanContent.name)
    private readonly lessonPlanContentModel: Model<LessonPlanContent>,
  ) {}

  public async create(
    createLessonPlanContentDto: CreateLessonPlanContentDto,
  ): Promise<LessonPlanContent> {
    const { lesson_plan_id, content_id } = createLessonPlanContentDto;
    this.logger.log(
      `Creating association between plan ${lesson_plan_id} and content ${content_id}`,
    );
    try {
      const exists = await this.lessonPlanContentModel.findOne({
        lesson_plan_id: createLessonPlanContentDto.lesson_plan_id,
        content_id: createLessonPlanContentDto.content_id,
        content_type: createLessonPlanContentDto.content_type,
      });

      if (exists) {
        throw new BadRequestException(
          'Content is already associated with this lesson plan',
        );
      }

      const createdLessonPlanContent = new this.lessonPlanContentModel(
        createLessonPlanContentDto,
      );
      return createdLessonPlanContent.save();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Failed to create lesson plan content association.`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred during association creation.',
      );
    }
  }

  public async findAll(): Promise<LessonPlanContent[]> {
    this.logger.log('Finding all lesson plan content associations.');
    try {
      return this.lessonPlanContentModel.find().exec();
    } catch (error) {
      this.logger.error(
        'Failed to find all lesson plan content associations.',
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving associations.',
      );
    }
  }

  public async findOneByContent(
    content_id: string,
    content_type: string,
  ): Promise<LessonPlanContent | null> {
    this.logger.log(
      `Finding one association by content ID ${content_id} and type ${content_type}`,
    );
    try {
      return this.lessonPlanContentModel
        .findOne({ content_id, content_type })
        .exec();
    } catch (error) {
      this.logger.error(
        `Failed to find association by content ${content_id}.`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving the association.',
      );
    }
  }

  public async getContentIdsByLessonPlan(
    lesson_plan_id: string,
    content_type: string,
  ): Promise<string[]> {
    this.logger.log(
      `Getting content IDs for lesson plan ID: ${lesson_plan_id}`,
    );
    try {
      const contents = await this.lessonPlanContentModel
        .find({ lesson_plan_id, content_type })
        .exec();
      return contents.map((c) => c.content_id);
    } catch (error) {
      this.logger.error(
        `Failed to get content IDs for lesson plan ${lesson_plan_id}.`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving content IDs.',
      );
    }
  }

  public async getContentsByLessonPlan(
    lessonPlanId: string,
  ): Promise<LessonPlanContent[]> {
    this.logger.log(
      `Getting all content associations for lesson plan ID: ${lessonPlanId}`,
    );
    try {
      return this.lessonPlanContentModel
        .find({ lesson_plan_id: lessonPlanId })
        .exec();
    } catch (error) {
      this.logger.error(
        `Failed to get contents for lesson plan ${lessonPlanId}.`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving associations.',
      );
    }
  }

  public async getAssociationsByContent(
    content_id: string,
    content_type: string,
  ): Promise<LessonPlanContent[]> {
    this.logger.log(`Getting all associations for content ID: ${content_id}`);
    try {
      return this.lessonPlanContentModel
        .find({ content_id, content_type })
        .exec();
    } catch (error) {
      this.logger.error(
        `Failed to get associations for content ${content_id}.`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving associations.',
      );
    }
  }

  public async checkIfContentExistsInPlan(
    lessonPlanId: string,
    contentId: string,
    contentType: string,
  ): Promise<boolean> {
    this.logger.log(
      `Checking if content ${contentId} exists in plan ${lessonPlanId}`,
    );
    try {
      const exists = await this.lessonPlanContentModel.findOne({
        lesson_plan_id: lessonPlanId,
        content_id: contentId,
        content_type: contentType,
      });
      return !!exists;
    } catch (error) {
      this.logger.error(
        `Failed to check for content ${contentId} in plan ${lessonPlanId}.`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred during the existence check.',
      );
    }
  }

  public async update(
    id: string,
    updateLessonPlanContentDto: UpdateLessonPlanContentDto,
  ): Promise<LessonPlanContent> {
    this.logger.log(`Updating lesson plan content association with ID: ${id}`);
    try {
      const updatedLessonPlanContent =
        await this.lessonPlanContentModel.findByIdAndUpdate(
          id,
          updateLessonPlanContentDto,
          { new: true },
        );
      if (!updatedLessonPlanContent) {
        throw new NotFoundException('Association not found for update.');
      }
      return updatedLessonPlanContent;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to update association with ID ${id}.`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while updating the association.',
      );
    }
  }

  public async remove(id: string): Promise<void> {
    this.logger.log(`Removing lesson plan content association with ID: ${id}`);
    try {
      const result = await this.lessonPlanContentModel.findByIdAndDelete(id);
      if (!result) {
        throw new NotFoundException('Association not found for removal.');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to remove association with ID ${id}.`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while removing the association.',
      );
    }
  }

  public async removeAllAssociationsByContentId(
    content_id: string,
    content_type: string,
  ): Promise<void> {
    this.logger.log(
      `Removing all associations for content ID: ${content_id} and type: ${content_type}`,
    );
    try {
      await this.lessonPlanContentModel.deleteMany({
        content_id,
        content_type,
      });
    } catch (error) {
      this.logger.error(
        `Failed to remove associations for content ${content_id}.`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while removing associations.',
      );
    }
  }
}
