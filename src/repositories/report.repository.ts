import { Types } from 'mongoose';

import Report from '../models/report.model';

import { IUser } from '../interfaces/IUser';
import { IBuilding } from '../interfaces/IBuilding';
import { EReportStatus } from '../interfaces/EReportStatus';
import { IReport, IReportModel } from '../interfaces/IReport';

export const createReport = async (report: Omit<IReport, '_id' | 'createdAt' | 'updatedAt'>) => {
  const newReport = new Report(report).save();
  return (await newReport)._doc;
};

export const updateReport = async (report: IReport, changes: Partial<IReport>) => {
  return unwrap(await Report.findByIdAndUpdate(report._id, {
    ...changes,
    updatedAt: new Date(),
  }, { new: true }).exec());
};

export const findManyByUser = async (user: IUser) => {
  const searchOptions: Record<keyof Pick<IReport, 'userId'>, any> = {
    userId: user._id,
  };

  const results = await Report.find(searchOptions).exec();
  return unwrapMany(results);
}

export const findActiveByBuilding = async (building: IBuilding) =>
  unwrap(await Report.findOne({
    buildingId: building._id,
    status: EReportStatus.InProcess,
  }).exec());

export const findOneById = async (id: string | Types.ObjectId) =>
  unwrap(await Report.findById(id).exec());

const unwrap = (entity: IReportModel | null) => entity?._doc;
const unwrapMany = (entities: IReportModel[]) => entities.map(e => unwrap(e));
