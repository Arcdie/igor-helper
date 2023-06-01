import { Types } from 'mongoose';

import User from '../models/user.model';

import { IUser, IUserModel } from '../interfaces/IUser';
import { ERole } from '../interfaces/ERole';

export const createUser = async (user: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>) => {
  const newUser = new User(user).save();
  return (await newUser)._doc;
};

export const findByRole = async (role: ERole) => unwrapMany(await User.find({ role}).exec());

export const findOneByEmail = async (email: string) => unwrap(await User.findOne({ email }).exec());
export const findOneById = async (id: string | Types.ObjectId) => unwrap(await User.findById(id).exec());

const unwrap = (entity: IUserModel | null) => entity?._doc;
const unwrapMany = (entities: IUserModel[]) => entities.map(e => e._doc);
