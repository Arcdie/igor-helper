import { Types } from 'mongoose';

import User from '../models/user.model';

import { IUser, IUserModel } from '../interfaces/IUser';

export const createUser = async (user: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>) => {
  const newUser = new User(user).save();
  return (await newUser)._doc;
};

export const findOneByEmail = async (email: string) => unwrap(await User.findOne({ email }).exec());
export const findOneById = async (id: string | Types.ObjectId) => unwrap(await User.findById(id).exec());

const unwrap = (entity: IUserModel | null) => entity?._doc;
