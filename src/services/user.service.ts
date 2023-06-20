import { clearObjectByTargetKeys } from '../libs/helper';

import * as mailService from './mail.service';

import * as userRepository from '../repositories/user.repository';

import { IUser } from '../interfaces/IUser';
import { ERole } from '../interfaces/ERole';
import { EErrorCode } from '../interfaces/EErrorCode';
import { IFail, ISuccess } from '../interfaces/IResult';
import { EResponseType } from '../interfaces/EResponseType';

import { UpdateUserDto, updateUserDto } from '../controllers/dto/updateUser.dto';

export const ALLOWED_FIELDS_TO_CHANGE = updateUserDto;

export const isAdmin = (user: IUser) => user.role === ERole.Admin;

export const updateUser = async (changes: UpdateUserDto, user: IUser): Promise<IFail | ISuccess<IUser>> => {
  changes = clearObjectByTargetKeys(ALLOWED_FIELDS_TO_CHANGE, changes);

  const result = await userRepository.updateUser(user, changes);

  if (!result) {
    return {
      status: false,
      message: EErrorCode.NO_RECORD_IN_DB,
      responseType: EResponseType.notFoundResponse,
    };
  }

  await mailService.mailUserUpdated(user.email);

  return {
    status: true,
    result,
  };
};
