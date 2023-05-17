import { HydratedDocument, Types } from 'mongoose';

import { ERole } from './ERole';

export interface IUserTemplate {
  email: string;
  password: string;

  name: string;
  phoneNumber: string;

  companyName: string;
  providerName: string;

  role: ERole;
}

export interface IUser extends IUserTemplate {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserModel extends HydratedDocument<IUser> {
  _doc: IUser & { _id: Types.ObjectId };
}
