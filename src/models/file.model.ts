import mongoose, { Types } from 'mongoose';

import { IFile, IFileModel } from '../interfaces/IFile';

const modelSchema: Record<keyof Omit<IFile, '_id'>, any> = {
  userId: {
    type: Types.ObjectId,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  originalName: {
    type: String,
    required: true,
  },

  extentionType: {
    type: String,
    required: true,
  },

  size: {
    type: Number,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: Date,
};

const File = new mongoose.Schema<IFileModel>(modelSchema, { versionKey: false });
export default mongoose.model<IFileModel>('File', File, 'files');
