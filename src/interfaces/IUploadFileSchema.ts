export interface IUploadFileSchema {
  fileId: string;
  isNew: boolean;
  file?: Express.Multer.File;
}
