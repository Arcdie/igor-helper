import { Response } from 'express';

import { EResponseType } from '../interfaces/EResponseType';

export const successResponse = <T>(res: Response, data: T) => res.status(200).json(data);
export const badRequestResponse = (res: Response, message = 'Bad Request') => res.status(400).json({ message });
export const unauthorizedResponse = (res: Response, message = 'Unauthorized') => res.status(401).json({ message });
export const forbiddenResponse = (res: Response, message = 'Forbidden') => res.status(403).json({ message });
export const notFoundResponse = (res: Response, message = 'Not Found') => res.status(404).json({ message });
export const errorResponse = (res: Response, message = 'Failed') => res.status(500).json({ message });

export const dynamicResponse = (responseType: EResponseType = EResponseType.badRequestResponse) => {
  return (res: Response, message: string) => {
    let execFunc;

    switch (responseType) {
      case EResponseType.unauthorizedResponse: execFunc = unauthorizedResponse; break;
      case EResponseType.forbiddenResponse: execFunc = forbiddenResponse; break;
      case EResponseType.notFoundResponse: execFunc = notFoundResponse; break;
      case EResponseType.errorResponse: execFunc = errorResponse; break;
      default: execFunc = badRequestResponse;
    }

    return execFunc(res, message);
  };
};
