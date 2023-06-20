import { IUser } from '../../interfaces/IUser';

export const updateUserDto = ['email', 'password', 'name', 'phoneNumber', 'companyName', 'providerName', 'role'];

export class UpdateUserDto {
  email?: IUser['email'];
  password?: IUser['password'];
  name?: IUser['name'];
  phoneNumber?: IUser['phoneNumber'];
  companyName?: IUser['companyName'];
  providerName?: IUser['providerName'];
  role?: IUser['role'];
}
