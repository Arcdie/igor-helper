import path from 'path';

import * as fsLib from '../libs/fs';
import { toUTF8, getUnix, getRandomString } from '../libs/helper';

import * as fileRepository from '../repositories/file.repository';

import { IFile } from '../interfaces/IFile';
import { IUser } from '../interfaces/IUser';

const folderForFileUploads = path.resolve(__dirname, '../../frontend/public/files');

export const createUniqueName = () => `${getRandomString(8)}-${getUnix()}`;
export const getExtensionType = (name: string) => name.split('.').at(-1) || 'undefined';

export const uploadFile = async (file: Express.Multer.File, user: IUser) => {
  const fileName = createUniqueName();
  const extention = getExtensionType(file.originalname);

  await fsLib.writeFile(folderForFileUploads, `${fileName}.${extention}`, file.buffer);

  return fileRepository.createFile({
    userId: user._id,
    name: fileName,
    size: Number(file.size),
    extentionType: extention,
    originalName: toUTF8(file.originalname),
  });
};

export const removeFile = async (file: IFile) => {
  await fsLib.removeFile(folderForFileUploads, `${file.name}.${file.extentionType}`);
  await fileRepository.removeFile(file);
};

export const getLinksByFiles = (files: IFile[]) => files.map(f => `/files/${f.name}.${f.extentionType}`);
