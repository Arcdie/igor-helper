import validator from 'validator';
import { Request, Response } from 'express';

import { setAuthCookies, removeAuthCookies } from '../libs/express';
import { checkBody, clearObjectByTargetKeys } from '../libs/helper';
import { badRequestResponse, dynamicResponse, successResponse } from '../libs/expressResponses';

import * as authService from '../services/auth.service';

import { loginUserDto, LoginUserDto } from './dto/loginUser.dto';
import { registerUserDto, RegisterUserDto } from './dto/registerUser.dto';

export const loginUser = async (req: Request, res: Response) => {
  const body: LoginUserDto = clearObjectByTargetKeys(loginUserDto, req.body);

  const errors = checkBody(loginUserDto, body);

  if (errors.length) {
    return badRequestResponse(res, `No ${errors.join(', ')}`);
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
    return badRequestResponse(res, `No ${errors.join(', ')}`);
  }

  if (!validator.isEmail(body.email)) {
    return badRequestResponse(res, 'Invalid email');
  }

  if (!validator.isLength(body.password, { min: 6 })) {
    return badRequestResponse(res, 'Password should contain 6 or more characters');
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
    return badRequestResponse(res, 'No or invalid email');
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
