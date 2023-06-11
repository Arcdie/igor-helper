import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';

import config from '../../config';

const initClient = () => new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKey,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

export const getBucketLink = () => `https://${config.aws.bucket}.s3.${config.aws.region}.amazonaws.com`;

export const upload = (file: Express.Multer.File, fileName: string, extention: string) => initClient().send(new PutObjectCommand({
  Bucket: config.aws.bucket,
  Key: `${fileName}.${extention}`,
  ACL: 'public-read',
  ContentLength: file.size,
  ContentType: file.mimetype,
  Body: file.buffer,
}));

export const deleteMany = (fullFileNames: string[]) => initClient().send(new DeleteObjectsCommand({
  Bucket: config.aws.bucket,
  Delete: { Objects: fullFileNames.map(Key => ({ Key })) },
}));
