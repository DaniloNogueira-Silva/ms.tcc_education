import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from './lesson.schema';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UserPayload } from '../auth/auth.service';
import { UserProgressService } from '../user_progress/user_progress.service';
import { CreateUserProgressDto } from '../user_progress/dto/create-user_progress.dto';
import { calculateLessonXp } from '../user_progress/xp.util';
import { LessonPlanContentService } from '../lesson_plan_content/lesson_plan_content.service';
import { UserProgress } from '../user_progress/user_progress.schema';
import { HttpRequest } from '../utils/http.request';

@Injectable()
export class LessonService {
  private readonly logger = new Logger(LessonService.name);

  public constructor(
    @InjectModel(Lesson.name)
    private lessonModel: Model<Lesson>,
    private readonly lessonPlanContentService: LessonPlanContentService,
    private readonly userProgressService: UserProgressService,
    private readonly httpService: HttpRequest,
  ) {}

  public async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const { lesson_plan_ids, ...lessonData } = createLessonDto;
    this.logger.log(`Creating lesson with name: "${lessonData.name}"`);
    let savedLesson: Lesson | null = null;
    try {
      const createdLesson = new this.lessonModel(lessonData);
      savedLesson = await createdLesson.save();

      if (lesson_plan_ids && lesson_plan_ids.length > 0) {
        await Promise.all(
          lesson_plan_ids.map((planId) =>
            this.lessonPlanContentService.create({
              lesson_plan_id: planId,
              content_id: String(savedLesson?._id),
              content_type: 'lesson',
            }),
          ),
        );
      }
      return savedLesson;
    } catch (error) {
      if (savedLesson) {
        this.logger.error(
          `Failed to create associations for lesson ${savedLesson._id}. Rolling back lesson creation.`,
        );
        await this.lessonModel.findByIdAndDelete(savedLesson._id);
      }
      this.logger.error('Failed to create lesson.', error.stack);
      throw new InternalServerErrorException(
        'A failure occurred during lesson creation.',
      );
    }
  }

  public async findAll(): Promise<Lesson[]> {
    this.logger.log('Finding all lessons.');
    try {
      return this.lessonModel.find().exec();
    } catch (error) {
      this.logger.error('Failed to find all lessons.', error.stack);
      throw new InternalServerErrorException(
        'A failure occurred while retrieving lessons.',
      );
    }
  }

  public async findAllByLessonPlan(lesson_plan_id: string): Promise<Lesson[]> {
    this.logger.log(
      `Finding all lessons for lesson plan ID: ${lesson_plan_id}`,
    );
    try {
      const contentIds =
        await this.lessonPlanContentService.getContentIdsByLessonPlan(
          lesson_plan_id,
          'lesson',
        );

      if (contentIds.length === 0) {
        return [];
      }

      return this.lessonModel.find({ _id: { $in: contentIds } }).exec();
    } catch (error) {
      this.logger.error(
        `Failed to find lessons for lesson plan ID: ${lesson_plan_id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving lessons.',
      );
    }
  }

  public async findOne(id: string): Promise<Lesson> {
    this.logger.log(`Finding lesson with ID: ${id}`);
    try {
      const lesson = await this.lessonModel.findById(id).exec();
      if (!lesson) {
        throw new NotFoundException(`Lesson with ID "${id}" not found.`);
      }
      return lesson;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to find lesson with ID: ${id}`, error.stack);
      throw new InternalServerErrorException(
        'A failure occurred while retrieving the lesson.',
      );
    }
  }

  public async update(
    id: string,
    updateLessonDto: Partial<UpdateLessonDto>,
  ): Promise<Lesson | null> {
    this.logger.log(`Updating lesson with ID: ${id}`);
    try {
      const updatedLesson = await this.lessonModel.findByIdAndUpdate(
        id,
        updateLessonDto,
        { new: true },
      );
      if (!updatedLesson) {
        throw new NotFoundException(
          `Lesson with ID "${id}" not found to update.`,
        );
      }
      return updatedLesson;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update lesson with ID: ${id}`, error.stack);
      throw new InternalServerErrorException(
        'A failure occurred while updating the lesson.',
      );
    }
  }

  public async updateLessonAndLessonPlans(
    lessonId: string,
    updateLessonDto: UpdateLessonDto,
  ) {
    this.logger.log(
      `Updating lesson and its plan associations for lesson ID: ${lessonId}`,
    );
    try {
      const { lesson_plan_ids, ...lessonData } = updateLessonDto;
      const updatedLesson = await this.update(lessonId, lessonData);

      if (!lesson_plan_ids) {
        return updatedLesson;
      }

      const currentAssociations =
        await this.lessonPlanContentService.getAssociationsByContent(
          lessonId,
          'lesson',
        );
      const currentPlanIds = currentAssociations.map((a) => a.lesson_plan_id);
      const toRemove = currentAssociations.filter(
        (a) => !lesson_plan_ids.includes(a.lesson_plan_id),
      );
      const toAdd = lesson_plan_ids.filter(
        (id) => !currentPlanIds.includes(id),
      );

      await Promise.all(
        toRemove.map((assoc) =>
          this.lessonPlanContentService.remove(String(assoc._id)),
        ),
      );
      await Promise.all(
        toAdd.map((id) =>
          this.lessonPlanContentService.create({
            lesson_plan_id: id,
            content_id: lessonId,
            content_type: 'lesson',
          }),
        ),
      );

      return updatedLesson;
    } catch (error) {
      this.logger.error(
        `Failed to update lesson and plan associations for lesson ID: ${lessonId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred during the update process.',
      );
    }
  }

  public async remove(id: string): Promise<void> {
    this.logger.log(`Removing lesson with ID: ${id}`);
    try {
      await this.lessonPlanContentService.removeAllAssociationsByContentId(
        id,
        'lesson',
      );
      const lesson = await this.lessonModel.findByIdAndDelete(id);

      if (!lesson) {
        throw new NotFoundException(
          `Lesson with ID "${id}" not found to remove.`,
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to remove lesson with ID: ${id}`, error.stack);
      throw new InternalServerErrorException(
        'A failure occurred while removing the lesson.',
      );
    }
  }

  public async getByUserRole(userPayload: UserPayload): Promise<any> {
    this.logger.log(
      `Getting lessons for user ID: ${userPayload.id} with role: ${userPayload.role}`,
    );
    try {
      const userRole = userPayload.role;
      if (userRole === 'TEACHER') {
        return this.lessonModel.find({ teacher_id: userPayload.id }).exec();
      }
    } catch (error) {
      this.logger.error(
        `Failed to get lessons for user ID: ${userPayload.id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while retrieving lessons.',
      );
    }
  }

  public async markLessonAsCompleted(
    userPayload: UserPayload,
    lesson_id: string,
  ): Promise<any> {
    this.logger.log(
      `User ${userPayload.id} is marking lesson ${lesson_id} as completed.`,
    );
    let userProgress: UserProgress | null = null;
    try {
      const lesson = await this.lessonModel.findById(lesson_id);
      if (!lesson) {
        throw new NotFoundException('Lesson not found.');
      }

      const contentAssignment =
        await this.lessonPlanContentService.findOneByContent(
          lesson.id,
          'lesson',
        );
      if (!contentAssignment) {
        throw new NotFoundException(
          'Lesson is not associated with any lesson plan.',
        );
      }

      const createUserProgressDto: CreateUserProgressDto = {
        user_id: userPayload.id,
        lesson_plan_id: contentAssignment.lesson_plan_id,
        external_id: lesson_id,
        type: 'LESSON',
        points: calculateLessonXp(lesson.type),
        coins: 20,
      };

      userProgress = await this.userProgressService.create(
        createUserProgressDto,
      );

      await this.httpService.completeActivity(userProgress);

      return userProgress;
    } catch (error) {
      if (userProgress) {
        this.logger.error(
          `External service call failed after creating progress ${userProgress._id}. Rolling back progress creation.`,
        );
        await this.userProgressService.remove(String(userProgress._id));
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to mark lesson ${lesson_id} as completed for user ${userPayload.id}.`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'A failure occurred while marking the lesson as completed.',
      );
    }
  }
}
