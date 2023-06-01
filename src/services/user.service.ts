import { createToken } from '../libs/jwt';

import * as mailService from './mail.service';
import * as userRepository from '../repositories/user.repository';

import { IUser } from '../interfaces/IUser';
import { ERole } from '../interfaces/ERole';
import { EErrorCode } from '../interfaces/EErrorCode';
import { IFail, ISuccess } from '../interfaces/IResult';

import { LoginUserDto } from '../controllers/dto/loginUser.dto';
import { RegisterUserDto } from '../controllers/dto/registerUser.dto';
import { EResponseType } from '../interfaces/EResponseType';

export const isAdmin = (user: IUser) => user.role !== ERole.Admin;

export const loginUser = async (loginDto: LoginUserDto): Promise<IFail | ISuccess<string>> => {
  const existUser = await userRepository.findOneByEmail(loginDto.email);

  if (!existUser || existUser.password !== loginDto.password) {
    return {
      status: false,
      responseType: EResponseType.forbiddenResponse,
      message: EErrorCode.NO_USER_WITH_THIS_CREDENTIALS,
    };
  }

  const authToken = createToken(existUser);

  return {
    status: true,
    result: authToken,
  }
};

export const registerUser = async (registrationDto: RegisterUserDto): Promise<IFail | ISuccess<string>> => {
  const existUser = await userRepository.findOneByEmail(registrationDto.email);

  if (existUser) {
    return {
      status: false,
      message: EErrorCode.EXIST_USER,
      responseType: EResponseType.badRequestResponse,
    };
  }

  const result = await userRepository.createUser({
    ...registrationDto,
    role: ERole.User,
  });

  const authToken = createToken(result);
  await mailService.mailAccountCreated(result.email);

  return {
    status: true,
    result: authToken,
  };
};

export const forgotPassword = async (email: string): Promise<IFail | ISuccess<string>> => {
  const user = await userRepository.findOneByEmail(email);

  if (!user) {
    return {
      status: true,
      result: email,
    };

    /*
    return {
      status: false,
      message: EErrorCode.NO_RECORD_IN_DB,
      responseType: EResponseType.notFoundResponse,
    };
    */
  }

  await mailService.mailForgotPassword(email, user.password);

  return {
    status: true,
    result: email,
  };
}
