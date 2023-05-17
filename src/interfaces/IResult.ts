import { EErrorCode } from './EErrorCode';
import { EResponseType } from './EResponseType';

export interface IFail {
  status: false;
  responseType: EResponseType;
  message: EErrorCode | string;
};

export interface ISuccess<T> {
  status: true;
  result: T;
};

export type TResult<T> = IFail | ISuccess<T>;
