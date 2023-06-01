import { IUser } from '../interfaces/IUser';
import { ERole } from '../interfaces/ERole';

export const isAdmin = (user: IUser) => user.role === ERole.Admin;
