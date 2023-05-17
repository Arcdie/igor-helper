import validator from 'validator';
import { Request, Response } from 'express';

import { checkBody, clearObjectByTargetKeys } from '../libs/helper';
import { badRequestResponse, dynamicResponse, successResponse } from '../libs/expressResponses';

import * as userService from '../services/user.service';

import { loginUserDto, LoginUserDto } from './dto/loginUser.dto';
import { registerUserDto, RegisterUserDto } from './dto/registerUser.dto';

export const loginUser = async (req: Request, res: Response) => {
  const body: LoginUserDto = clearObjectByTargetKeys(loginUserDto, req.body);

  const errors = checkBody(loginUserDto, body);

  if (errors.length) {
    return badRequestResponse(res, `No ${errors.join(', ')}`);
  }

  const result = await userService.loginUser(body);

  if (!result.status) {
    return dynamicResponse(result.responseType)(res, result.message);
  }

  return successResponse(res, result);
};

export const registerUser = async (req: Request, res: Response) => {
  const body: RegisterUserDto = clearObjectByTargetKeys(registerUserDto, req.body);

  const errors = checkBody(loginUserDto, body);

  if (errors.length) {
    return badRequestResponse(res, `No ${errors.join(', ')}`);
  }

  if (!validator.isEmail(body.email)) {
    return badRequestResponse(res, 'Invalid email');
  }

  if (!validator.isLength(body.password, { min: 6 })) {
    return badRequestResponse(res, 'Password should contain 6 or more characters');
  }

  const result = await userService.registerUser(body);

  if (!result.status) {
    return dynamicResponse(result.responseType)(res, result.message);
  }

  return successResponse(res, result);
};
