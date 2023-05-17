import mongoose, { Types } from 'mongoose';

import { ERole } from '../interfaces/ERole';
import { IUser, IUserModel } from '../interfaces/IUser';

const modelSchema: Record<keyof Omit<IUser, '_id'>, any> = {
  email: {
    type: String,
    unique: true,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: Number,
    enum: ERole,
    default: ERole.User,
  },

  name: {
    type: String,
    required: true,
  },

  phoneNumber: {
    type: String,
    required: true,
  },

  companyName: {
    type: String,
    required: true,
  },

  providerName: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: Date,
};

const User = new mongoose.Schema<IUserModel>(modelSchema, { versionKey: false });
export default mongoose.model<IUserModel>('User', User, 'users');
