import { HydratedDocument, Types } from 'mongoose';

import { EReportStatus } from './EReportStatus';

export interface IReportTemplate {
  listEquipment: string;
  listSerialNumber: string;
  comment?: string;
  status: EReportStatus;
}

export interface IReport extends IReportTemplate {
  _id: string;
  userId: string;
  buildingId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReportModel extends HydratedDocument<IReport> {
  _doc: IReport & { _id: Types.ObjectId };
}
