import { Request, Response } from 'express';

import { isAdmin } from '../services/user.service';
import { getSettings } from '../services/settings.service';

export const getIndexPage = (req: Request, res: Response) => res.redirect('/buildings');

export const getBuildingsPage = (req: Request, res: Response) => {
  res.render(`web/buildings/buildings${isAdmin(req.user) ? 'Admin' : 'User'}`, {
    settings: getSettings().result,
  });
};

export const getPublicFilesPage = (req: Request, res: Response) => {
  res.render('web/publicFiles');
};

export const getLoginPage = (req: Request, res: Response) => {
  res.render('web/auth/login');
};

export const getRegistrationPage = (req: Request, res: Response) => {
  res.render('web/auth/registration');
};

export const getForgotPasswordPage = (req: Request, res: Response) => {
  res.render('web/auth/forgotPassword');
};
