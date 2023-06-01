import fs from 'fs';

export const writeFile = (pathToFile: string, fileName: string, data: string | NodeJS.ArrayBufferView) =>
  new Promise((res, rej) => fs.writeFile(`${pathToFile}/${fileName}`, data, err => err ? rej(err) : res(null)));

export const removeFile = (pathToFile: string, fileName: string) =>
  new Promise((res, rej) => fs.unlink(`${pathToFile}/${fileName}`, err => err ? rej(err) : res(null)));
