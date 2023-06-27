import { Request, Response, NextFunction } from 'express';

import { getSettings } from '../services/settings.service';

export default async (req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    res.locals.user = req.user;
  }

  res.locals.settings = getSettings().result;

  next();
};
