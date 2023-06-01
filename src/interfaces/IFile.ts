import { HydratedDocument, Types } from 'mongoose';

export interface IFileTemplate {
  name: string;
  originalName: string;
  extentionType: string;
  size: number;
}

export interface IFile extends IFileTemplate {
  _id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFileModel extends HydratedDocument<IFile> {
  _doc: IFile & { _id: Types.ObjectId };
}
