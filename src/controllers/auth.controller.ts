import validator from 'validator';
import { Request, Response } from 'express';

import { setAuthCookies, removeAuthCookies } from '../libs/express';
import { checkBody, clearObjectByTargetKeys } from '../libs/helper';
import { badRequestResponse, dynamicResponse, successResponse } from '../libs/expressResponses';

import * as authService from '../services/auth.service';

import { EErrorCode } from '../interfaces/EErrorCode';
import { loginUserDto, LoginUserDto } from './dto/loginUser.dto';
import { registerUserDto, RegisterUserDto } from './dto/registerUser.dto';

export const loginUser = async (req: Request, res: Response) => {
  const body: LoginUserDto = clearObjectByTargetKeys(loginUserDto, req.body);

  const errors = checkBody(loginUserDto, body);

  if (errors.length) {
    return badRequestResponse(res, `Немає ${errors.join(', ')} в запиті`);
  }

  const result = await authService.loginUser(body);

  if (!result.status) {
    return dynamicResponse(result.responseType)(res, result.message);
  }

  setAuthCookies(res, result.result);
  return successResponse(res, result);
};

export const registerUser = async (req: Request, res: Response) => {
  const body: RegisterUserDto = clearObjectByTargetKeys(registerUserDto, req.body);

  const errors = checkBody(loginUserDto, body);

  if (errors.length) {
    return badRequestResponse(res, `Немає ${errors.join(', ')} в запиті`);
  }

  if (!validator.isEmail(body.email)) {
    return badRequestResponse(res, EErrorCode.INVALID_EMAIL);
  }

  if (!validator.isLength(body.password, { min: 6 })) {
    return badRequestResponse(res, EErrorCode.INVALID_PASSWORD);
  }

  const result = await authService.registerUser(body);

  if (!result.status) {
    return dynamicResponse(result.responseType)(res, result.message);
  }

  setAuthCookies(res, result.result);
  return successResponse(res, result);
};

export const forgotPassword = async (req: Request, res: Response) => {
  const body: { email: string } = req.body;

  if (!body.email || !validator.isEmail(body.email)) {
    return badRequestResponse(res, EErrorCode.INVALID_EMAIL);
  }

  const result = await authService.forgotPassword(body.email);

  if (!result.status) {
    return dynamicResponse(result.responseType)(res, result.message);
  }

  return successResponse(res, result);
};

export const logoutUser = async (req: Request, res: Response) => {
  removeAuthCookies(res);
  return res.redirect('/');
};
