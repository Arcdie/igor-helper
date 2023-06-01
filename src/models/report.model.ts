import mongoose, { Types } from 'mongoose';

import { EReportStatus } from '../interfaces/EReportStatus';
import { IReport, IReportModel } from '../interfaces/IReport';

const modelSchema: Record<keyof Omit<IReport, '_id'>, any> = {
  userId: {
    type: Types.ObjectId,
    required: true,
  },

  buildingId: {
    type: Types.ObjectId,
    required: true,
  },

  listEquipment: {
    type: String,
    required: true,
  },

  listSerialNumber: {
    type: String,
    required: true,
  },

  status: {
    type: Number,
    enum: EReportStatus,
    required: true,
  },

  comment: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: Date,
};

const Report = new mongoose.Schema<IReportModel>(modelSchema, { versionKey: false });
export default mongoose.model<IReportModel>('Report', Report, 'reports');
