import { sign, verify } from 'jsonwebtoken';

import config from '../config';

import { IUserModel } from '../interfaces/IUser';

type TJWTContent = Pick<IUserModel, '_id' | 'name' | 'role'>;

export const createToken = (data: TJWTContent) => sign(data, config.jwt.secret);

export const verifyToken = (token: string) => {
  const result = verify(token, config.jwt.secret);
  return (!result || typeof result === 'string') ? false : result as TJWTContent;
};
