import { IUser } from '../../interfaces/IUser';

export const registerUserDto = ['email', 'password', 'name', 'phoneNumber', 'companyName', 'providerName'];

export class RegisterUserDto {
  email: IUser['email'];
  password: IUser['password'];
  name: IUser['name'];
  phoneNumber: IUser['phoneNumber'];
  companyName: IUser['companyName'];
  providerName: IUser['providerName'];
}
