import File from '../models/file.model';

import { IFile, IFileModel } from '../interfaces/IFile';

export const createFile = async (file: Omit<IFile, '_id' | 'createdAt' | 'updatedAt'>) => {
  const newFile = new File(file).save();
  return (await newFile)._doc;
};

export const removeFile = async (file: IFile) => File.deleteOne(file);

export const findManyByIds = async (fileIds: string[]) => {
  return unwrapMany(await File.find({ _id: { $in: fileIds } }).exec());
};

const unwrap = (entity: IFileModel | null) => entity?._doc;
const unwrapMany = (entities: IFileModel[]) => entities.map(e => e._doc);
