import ReportFileBound from '../models/reportFileBound.model';

import { IReport } from '../interfaces/IReport';
import { IReportFileBound, IReportFileBoundModel } from '../interfaces/IReportFileBound';

export const createReportFileBound = async (reportFileBound: Omit<IReportFileBound, '_id' | 'createdAt' | 'updatedAt'>) => {
  const newReportFileBound = new ReportFileBound(reportFileBound).save();
  return (await newReportFileBound)._doc;
};

export const findManyByReport = async (report: IReport) => {
  const searchOptions: Record<keyof Pick<IReportFileBound, 'reportId'>, any> = {
    reportId: report._id,
  };

  return unwrapMany(await ReportFileBound.find(searchOptions).exec());
};

export const removeReportFileBoundsByBounds = (reportFileBounds: IReportFileBound[]) => {
  ReportFileBound.deleteMany({ _id: { $in: reportFileBounds.map(b => b._id) } }).exec();
}

const unwrap = (entity: IReportFileBoundModel | null) => entity?._doc;
const unwrapMany = (entities: IReportFileBoundModel[]) => entities.map(e => e._doc);
