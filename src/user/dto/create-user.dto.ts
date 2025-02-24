import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

import { UserRoles } from '../enum/roles.enum';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsString()
  role: UserRoles;
}
