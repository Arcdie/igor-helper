import mongoose, { Types } from 'mongoose';

import { IReportFileBound, IReportFileBoundModel } from '../interfaces/IReportFileBound';

const modelSchema: Record<keyof Omit<IReportFileBound, '_id'>, any> = {
  fileId: {
    type: Types.ObjectId,
    required: true,
  },

  reportId: {
    type: Types.ObjectId,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: Date,
};

const ReportReportFileBound = new mongoose.Schema<IReportFileBoundModel>(modelSchema, { versionKey: false });
export default mongoose.model<IReportFileBoundModel>('ReportFileBound', ReportReportFileBound, 'report-file-bounds');
