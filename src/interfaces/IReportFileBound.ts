import { HydratedDocument, Types } from 'mongoose';

export interface IReportFileBoundTemplate { }

export interface IReportFileBound extends IReportFileBoundTemplate {
  _id: string;
  fileId: string;
  reportId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReportFileBoundModel extends HydratedDocument<IReportFileBound> {
  _doc: IReportFileBound & { _id: Types.ObjectId };
}
