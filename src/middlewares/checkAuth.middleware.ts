import { Request, Response, NextFunction } from 'express';

import { verifyToken } from '../libs/jwt';
import { unauthorizedResponse } from '../libs/expressResponses';

import * as userRepository from '../repositories/user.repository';

import { EErrorCode } from '../interfaces/EErrorCode';

const getTokenFromRequest = (req: Request): string | null =>
  req.cookies?.authorization || req.cookies?.Authorization || req.headers?.authorization || req.headers?.Authorization;

export default async (req: Request, res: Response, next: NextFunction) => {
  let token = getTokenFromRequest(req);

  if (!token) {
    return unauthorizedResponse(res, EErrorCode.INVALID_AUTH_TOKEN);
  }

  if (token.includes('Bearer ')) {
    token = token.replace('Bearer ', '');
  }

  const tokenData = verifyToken(token);

  if (!tokenData) {
    return unauthorizedResponse(res, EErrorCode.INVALID_AUTH_TOKEN);
  }

  const user = await userRepository.findOneById(tokenData._id);

  if (!user) {
    return unauthorizedResponse(res, EErrorCode.INVALID_AUTH_TOKEN);
  }

  req.user = user;
  next();
};
