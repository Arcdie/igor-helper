import multer from 'multer';

const upload = multer();

export const singleUpload = upload.single('file');
export const multipleUpload = upload.array('files');
