import { ForbiddenException } from '@nestjs/common';
import { UserPayload } from 'src/auth/auth.service';
import { UserRoles } from 'src/user/enum/roles.enum';

export class UserValidator {
  async validateAccess(
    payload: UserPayload
  ): Promise<void> {
    if (
      payload.role == UserRoles.TEACHER
    ) {
      return;
    }

    if (
      payload.role == UserRoles.STUDENT
    ) {
      return;
    }

    throw new ForbiddenException('Usuário não possui permissão.');
  }
}
