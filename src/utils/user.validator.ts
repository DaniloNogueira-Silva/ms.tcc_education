import { ActionTypes } from 'src/user/enum/action_types.enum';
import { ForbiddenException } from '@nestjs/common';
import { UserPayload } from 'src/auth/auth.service';
import { UserRoles } from 'src/user/enum/roles.enum';

export class UserValidator {
  async validateAccess(
    payload: UserPayload,
    action: ActionTypes,
  ): Promise<void> {
    const teacherPermissions: ActionTypes[] = [
      ActionTypes.CREATE_USER,
      ActionTypes.UPDATE_USER,
      ActionTypes.GET_ALL_USER,
      ActionTypes.GET_USER,

      ActionTypes.UPDATE_SCHOOL,
      ActionTypes.GET_SCHOOL,
      ActionTypes.CREATE_SCHOOL,
      ActionTypes.DELETE_SCHOOL,

      ActionTypes.UPDATE_LESSON_PLAN,
      ActionTypes.GET_LESSON_PLAN,
      ActionTypes.GET_ALL_LESSON_PLAN,
      ActionTypes.CREATE_LESSON_PLAN,
      ActionTypes.DELETE_LESSON_PLAN,

      ActionTypes.UPDATE_CLASSES,
      ActionTypes.GET_CLASSES,
      ActionTypes.GET_ALL_CLASSES,
      ActionTypes.CREATE_CLASSES,
      ActionTypes.DELETE_CLASSES,

      ActionTypes.UPDATE_EXERCISE,
      ActionTypes.GET_EXERCISE,
      ActionTypes.GET_ALL_EXERCISE,
      ActionTypes.CREATE_EXERCISE,
      ActionTypes.DELETE_EXERCISE,

      ActionTypes.GET_ALL_USER_CLASS_PROGRESS,
      ActionTypes.GET_USER_CLASS_PROGRESS,
      ActionTypes.CREATE_USER_CLASS_PROGRESS,
      ActionTypes.UPDATE_USER_CLASS_PROGRESS,
      ActionTypes.DELETE_USER_CLASS_PROGRESS,

      ActionTypes.CREATE_USER_MAP_PROGRESS,
      ActionTypes.UPDATE_USER_MAP_PROGRESS,
      ActionTypes.GET_ALL_USER_MAP_PROGRESS,
      ActionTypes.GET_USER_MAP_PROGRESS,
      ActionTypes.DELETE_USER_MAP_PROGRESS,

      ActionTypes.CREATE_EXERCISE,
      ActionTypes.UPDATE_EXERCISE,
      ActionTypes.DELETE_EXERCISE,
      ActionTypes.GET_ALL_EXERCISE,
      ActionTypes.GET_EXERCISE,
    ];

    const studentPermissions: ActionTypes[] = [
      ActionTypes.CREATE_USER,
      ActionTypes.UPDATE_USER,
      ActionTypes.GET_USER,
      ActionTypes.DELETE_USER,
      ActionTypes.GET_ALL_USER,

      ActionTypes.GET_ALL_LESSON_PLAN,
      ActionTypes.GET_LESSON_PLAN,

      ActionTypes.GET_ALL_CLASSES,
      ActionTypes.GET_CLASSES,

      ActionTypes.GET_ALL_EXERCISE,
      ActionTypes.GET_EXERCISE,

      ActionTypes.GET_ALL_USER_CLASS_PROGRESS,
      ActionTypes.GET_USER_CLASS_PROGRESS,

      ActionTypes.CREATE_USER_MAP_PROGRESS,
      ActionTypes.GET_ALL_USER_MAP_PROGRESS,
      ActionTypes.GET_USER_MAP_PROGRESS,

      ActionTypes.GET_EXERCISE,
      ActionTypes.GET_ALL_EXERCISE,

      ActionTypes.UPDATE_USER_CLASS_PROGRESS,
      ActionTypes.UPDATE_USER_MAP_PROGRESS,
      ActionTypes.UPDATE_EXERCISE,
    ];

    if (
      payload.role == UserRoles.TEACHER &&
      teacherPermissions.includes(action)
    ) {
      return;
    }

    if (
      payload.role == UserRoles.STUDENT &&
      studentPermissions.includes(action)
    ) {
      return;
    }

    if (payload.role.includes(action)) {
      return;
    }

    throw new ForbiddenException('Usuário não possui permissão.');
  }
}
