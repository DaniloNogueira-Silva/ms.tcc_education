import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { UserPayload } from '../auth/auth.service';
import { UserProgressService } from '../user_progress/user_progress.service';
import { CreateUserProgressDto } from '../user_progress/dto/create-user_progress.dto';
import { UserProgress } from '../user_progress/user_progress.schema';
import { ExerciseList } from './exercise_list.schema';
import { CreateExerciseListDto } from './dto/create-exercise_list.dto';
import { UpdateExerciseListDto } from './dto/update-exercise_list.dto';
import { LessonPlanContentService } from 'src/lesson_plan_content/lesson_plan_content.service';
import { ExerciseService } from 'src/exercise/exercise.service';
import { ExerciseListAttemptService } from '../exercise_list_attempt/exercise_list_attempt.service';
import { ExerciseListAttempt } from '../exercise_list_attempt/exercise_list_attempt.schema';

@Injectable()
export class ExerciseListService {
  constructor(
    @InjectModel(ExerciseList.name)
    private exerciselistModel: Model<ExerciseList>,

    private readonly lessonPlanContentService: LessonPlanContentService,

    private readonly userProgressService: UserProgressService,

    private readonly exerciseService: ExerciseService,

    private readonly attemptService: ExerciseListAttemptService,
  ) {}

  async create(
    createExerciseListDto: CreateExerciseListDto,
  ): Promise<ExerciseList> {
    const { lesson_plan_ids, ...exerciseListData } = createExerciseListDto;

    const createdExerciseList = new this.exerciselistModel(exerciseListData);
    const savedExerciseList = await createdExerciseList.save();

    if (lesson_plan_ids && lesson_plan_ids.length > 0) {
      await Promise.all(
        lesson_plan_ids.map((lesson_plan_id) =>
          this.lessonPlanContentService.create({
            lesson_plan_id,
            content_id: String(savedExerciseList._id),
            content_type: 'exercise_list',
          }),
        ),
      );
    }

    return createdExerciseList.save();
  }
  async findAll(): Promise<ExerciseList[]> {
    return this.exerciselistModel.find().exec();
  }

  async findAllByLessonPlan(lesson_plan_id: string) {
    const contentIds =
      await this.lessonPlanContentService.getContentIdsByLessonPlan(
        lesson_plan_id,
      );

    if (contentIds.length === 0) {
      return [];
    }

    const exercise_lists = await this.exerciselistModel
      .find({ _id: { $in: contentIds } })
      .exec();

    return exercise_lists;
  }

  async findOne(id: string): Promise<ExerciseList> {
    const ExerciseLists = await this.exerciselistModel.findById(id);
    if (!ExerciseLists)
      throw new NotFoundException('Lista de exercício não encontrado');
    return ExerciseLists;
  }

  async update(
    id: string,
    updateExerciseListDto: UpdateExerciseListDto,
  ): Promise<ExerciseList | null> {
    return this.exerciselistModel.findByIdAndUpdate(id, updateExerciseListDto, {
      new: true,
    });
  }

  async updateExerciseListAndLessonPlans(
    exercise_list_id: string,
    updateExerciseListDto: UpdateExerciseListDto,
  ) {
    const { lesson_plan_ids, ...exerciseListData } = updateExerciseListDto;
    const updatedExerciseList = await this.update(
      exercise_list_id,
      exerciseListData,
    );

    if (!lesson_plan_ids) {
      return updatedExerciseList;
    }
    const currentAssociations =
      await this.lessonPlanContentService.getAssociationsByContent(
        exercise_list_id,
        'exercise_list',
      );

    const currentPlanIds = currentAssociations.map((a) => a.lesson_plan_id);

    const toRemove = currentAssociations.filter(
      (a) => !lesson_plan_ids.includes(a.lesson_plan_id),
    );

    const toAdd = lesson_plan_ids.filter((id) => !currentPlanIds.includes(id));

    await Promise.all(
      toRemove.map((assoc) =>
        this.lessonPlanContentService.remove(String(assoc._id)),
      ),
    );

    await Promise.all(
      toAdd.map((id) =>
        this.lessonPlanContentService.create({
          lesson_plan_id: id,
          content_id: exercise_list_id,
          content_type: 'exercise_list',
        }),
      ),
    );

    return updatedExerciseList;
  }

  async remove(id: string): Promise<void> {
    await this.exerciselistModel.findByIdAndDelete(id);
  }

  async getByUserRole(userPayload: UserPayload): Promise<any> {
    const userRole = userPayload.role;

    if (userRole === 'TEACHER') {
      const exerciselists = await this.exerciselistModel
        .find({
          teacher_id: userPayload.id,
        })
        .exec();

      return exerciselists;
    }
  }

  async submitExerciseListAnswers(
    userPayload: UserPayload,
    exercise_list_id: string,
    exercise_id: string,
    createUserProgressDto: CreateUserProgressDto,
  ): Promise<ExerciseListAttempt> {
    const exercise = await this.exerciseService.findOne(exercise_id);

    if (!exercise) {
      throw new NotFoundException('Exercício não encontrado');
    }

    const exerciseList =
      await this.exerciselistModel.findById(exercise_list_id);

    if (!exerciseList) {
      throw new NotFoundException('Lista de exercício não encontrada');
    }

    const contentAssignment =
      await this.lessonPlanContentService.findOneByContent(
        exerciseList.id,
        'exercise_list',
      );

    if (!contentAssignment) {
      throw new NotFoundException(
        'Associação do exercício com plano de aula não encontrada',
      );
    }

    let userProgress: UserProgress;

    try {
      userProgress = await this.userProgressService.findOneByExerciseAndUser(
        exerciseList.id,
        userPayload.id,
      );
    } catch (err) {
      const createUserProgress: CreateUserProgressDto = {
        user_id: userPayload.id,
        lesson_plan_id: contentAssignment.lesson_plan_id,
        external_id: exerciseList.id,
        type: 'EXERCISE_LIST',
      };

      userProgress = await this.userProgressService.create(createUserProgress);
    }

    const attempt = await this.attemptService.create({
      user_progress_id: userProgress.id,
      exercise_id,
      answer: createUserProgressDto.answer,
    });

    // await axios.post(
    //   'http://localhost:3003/user-character/complete-activity',
    //   userProgress,
    // );
    return attempt;
  }

  async markExerciseListAsCompleted(
    userPayload: UserPayload,
    exercise_list_id: string,
  ): Promise<UserProgress> {
    const exerciselist =
      await this.exerciselistModel.findById(exercise_list_id);

    if (!exerciselist)
      throw new NotFoundException('Lista de exercício não encontrada');

    const contentAssignment =
      await this.lessonPlanContentService.findOneByContent(
        exerciselist.id,
        'exercise_list',
      );

    if (!contentAssignment) {
      throw new NotFoundException(
        'Associação do exercício com plano de aula não encontrada',
      );
    }
    let userProgress: UserProgress;
    try {
      userProgress = await this.userProgressService.findOneByExerciseAndUser(
        exercise_list_id,
        userPayload.id,
      );
    } catch (err) {
      const createUserProgress: CreateUserProgressDto = {
        user_id: userPayload.id,
        lesson_plan_id: contentAssignment.lesson_plan_id,
        external_id: exercise_list_id,
        type: 'EXERCISE_LIST',
      };
      userProgress = await this.userProgressService.create(createUserProgress);
    }

    await this.userProgressService.update(userProgress.id, { points: 100 });

    return userProgress;
  }

  async isCompletedByUser(
    exercise_list_id: string,
    userId: string,
  ): Promise<boolean> {
    return this.userProgressService.hasCompletedExercise(
      exercise_list_id,
      userId,
    );
  }

  async isDeadlinePassed(exercise_id: string): Promise<boolean> {
    const exercise_list = await this.exerciselistModel
      .findById(exercise_id, { due_date: 1 })
      .exec();

    if (!exercise_list) {
      throw new NotFoundException('Lista de exercício não encontrado');
    }

    if (!exercise_list.due_date) {
      return false;
    }

    return new Date(exercise_list.due_date).getTime() < Date.now();
  }
}
