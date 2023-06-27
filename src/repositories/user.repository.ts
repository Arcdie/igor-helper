import { Types } from 'mongoose';

import User from '../models/user.model';

import { ERole } from '../interfaces/ERole';
import { IUser, IUserModel } from '../interfaces/IUser';

export const createUser = async (user: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>) => {
  const newUser = new User(user).save();
  return (await newUser)._doc;
};

export const findManyBy = async (
  options: {
    role?: ERole,
    email?: string,
  } = {},
) => {
  const searchOptions: {
    role?: ERole;
    email?: any;
  } = {};

  if (options.role) {
    searchOptions.role = options.role;
  }

  if (options.email) {
    searchOptions.email = { $regex: options.email, $options: 'i' };
  }

  return unwrapMany(await User.find(searchOptions).exec());
}


export const findOneByEmail = async (email: string) => unwrap(await User.findOne({ email }).exec());
export const findOneById = async (id: string | Types.ObjectId) => unwrap(await User.findById(id).exec());
export const findManyById = async (ids: string[] | Types.ObjectId[]) => unwrapMany(await User.find({ _id: { $in: ids } }).exec());

export const updateUser = async (user: IUser, changes: Partial<IUser>) => {
  return unwrap(await User.findByIdAndUpdate(user._id, {
    ...changes,
    updatedAt: new Date(),
  }, { new: true }).exec());
};

const unwrap = (entity: IUserModel | null) => entity?._doc;
const unwrapMany = (entities: IUserModel[]) => entities.map(e => e._doc);
