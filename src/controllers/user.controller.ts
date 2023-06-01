import { Request, Response } from 'express';

import {
  successResponse,
  forbiddenResponse,
  unauthorizedResponse,
} from '../libs/expressResponses';

import * as userService from '../services/user.service';

import * as userRepository from '../repositories/user.repository';

import { ERole } from '../interfaces/ERole';
import { EErrorCode } from '../interfaces/EErrorCode';

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
