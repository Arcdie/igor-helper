import { HydratedDocument, Types } from 'mongoose';

export interface IBuildingTemplate {
  name: string;
  regionName: string;
  listEquipment: string[];
  x: string;
  y: string;
  comment?: string;
  isReserved: boolean;
}

export interface IBuilding extends IBuildingTemplate {
  _id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date;
}

export interface IBuildingModel extends HydratedDocument<IBuilding> {
  _doc: IBuilding & { _id: Types.ObjectId };
}
