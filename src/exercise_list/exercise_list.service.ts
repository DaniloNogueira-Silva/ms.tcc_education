import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserPayload } from 'src/auth/auth.service';
import { UserProgressService } from 'src/user_progress/user_progress.service';
import { CreateUserProgressDto } from 'src/user_progress/dto/create-user_progress.dto';
import { ExerciseList } from './exercise_list.schema';
import { CreateExerciseListDto } from './dto/create-exercise_list.dto';
import { UpdateExerciseListDto } from './dto/update-exercise_list.dto';

@Injectable()
export class ExerciseListService {
  constructor(
    @InjectModel(ExerciseList.name)
    private exerciselistModel: Model<ExerciseList>,

    private readonly userProgressService: UserProgressService,
  ) {}

  async create(
    createExerciseListDto: CreateExerciseListDto,
  ): Promise<ExerciseList> {
    const createdExerciseList = new this.exerciselistModel(
      createExerciseListDto,
    );
    return createdExerciseList.save();
  }

  async findAll(): Promise<ExerciseList[]> {
    return this.exerciselistModel.find().exec();
  }

  async findOne(id: string): Promise<ExerciseList> {
    const ExerciseLists = await this.exerciselistModel.findById(id);
    if (!ExerciseLists) throw new NotFoundException('Lista de exercício não encontrado');
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

  async markExerciseListAsCompleted(
    userPayload: UserPayload,
    id: string,
  ): Promise<any> {
    const exerciselist = await this.exerciselistModel.findById(id);
    if (!exerciselist) throw new NotFoundException('Lista de exercício não encontrada');

    const createUserProgressDto: CreateUserProgressDto = {
      user_id: userPayload.id,
      lesson_plan_id: exerciselist.lesson_plan_id,
      external_id: exerciselist.id,
      type: 'EXERCISELIST',
      points: 100,
    };

    const userProgress = await this.userProgressService.create(
      createUserProgressDto,
    );

    return userProgress;
  }
}
