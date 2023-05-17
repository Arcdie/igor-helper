import { Request, Response } from 'express';

export const getIndexPage = (req: Request, res: Response) => {
  res.render('web/index');
};
