import validator from 'validator';
import { Request, Response } from 'express';

import {
  isEmptyObject,
  clearObjectByTargetKeys,
} from '../libs/helper';

import {
  dynamicResponse,
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  badRequestResponse,
  unauthorizedResponse,
} from '../libs/expressResponses';

import * as userService from '../services/user.service';

import * as userRepository from '../repositories/user.repository';

import { ERole } from '../interfaces/ERole';
import { EErrorCode } from '../interfaces/EErrorCode';

import { updateUserDto, UpdateUserDto } from './dto/updateUser.dto';

export const getClients = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user || !user._id) {
    return unauthorizedResponse(res, EErrorCode.INVALID_AUTH_TOKEN);
  }

  if (!userService.isAdmin(user)) {
    return forbiddenResponse(res, EErrorCode.NO_PERMISSIONS);
  }

  const results = await userRepository.findByRole(ERole.User);

  return successResponse(res, {
    status: true,
    result: results.map(r => ({
      ...r,
      password: undefined,
    })),
  });
};

export const getUserById = async (req: Request, res: Response) => {
  const user = req.user;
  const { userId }: { userId?: string } = req.params;

  if (!user || !user._id) {
    return unauthorizedResponse(res, EErrorCode.INVALID_AUTH_TOKEN);
  }

  if (!userService.isAdmin(user)) {
    return forbiddenResponse(res, EErrorCode.NO_PERMISSIONS);
  }

  if (!userId || !validator.isMongoId(userId)) {
    return badRequestResponse(res, EErrorCode.INVALID_ID);
  }

  const result = await userRepository.findOneById(userId);

  if (!result) {
    return notFoundResponse(res, EErrorCode.NO_RECORD_IN_DB);
  }

  return successResponse(res, {
    status: true,
    result,
  });
};

export const updateUser = async (req: Request, res: Response) => {
  const user = req.user;
  const { userId }: { userId?: string } = req.params;
  const body: UpdateUserDto = clearObjectByTargetKeys(updateUserDto, req.body);

  if (!user || !user._id) {
    return unauthorizedResponse(res, EErrorCode.INVALID_AUTH_TOKEN);
  }

  if (!userService.isAdmin(user)) {
    return forbiddenResponse(res, EErrorCode.NO_PERMISSIONS);
  }

  if (!userId || !validator.isMongoId(userId)) {
    return badRequestResponse(res, EErrorCode.INVALID_ID);
  }

  if (isEmptyObject(body)) {
    return badRequestResponse(res, EErrorCode.EMPTY_BODY);
  }

  if (body.role && !Object.values(ERole).includes(body.role)) {
    return badRequestResponse(res, EErrorCode.INVALID_ROLE);
  }

  const targetUser = await userRepository.findOneById(userId);

  if (!targetUser) {
    return notFoundResponse(res, EErrorCode.NO_RECORD_IN_DB);
  }

  const result = await userService.updateUser(body, targetUser);

  if (!result.status) {
    return dynamicResponse(result.responseType)(res, result.message);
  }

  return successResponse(res, result);
};
