import { IUser } from '../../interfaces/IUser';

export const loginUserDto = ['email', 'password'];

export class LoginUserDto {
  email: IUser['email'];
  password: IUser['password'];
}
