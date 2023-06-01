import { Request, Response, NextFunction } from 'express';

import { getTokenFromRequest } from './checkAuth.middleware';

export default async (req: Request, res: Response, next: NextFunction) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.redirect('/auth/login');
  }

  next();
};
