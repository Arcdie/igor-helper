import { Request, Response } from 'express';

import { successResponse } from '../libs/expressResponses';

import { getSettings } from '../services/settings.service';

export const getCommonSettings = async (req: Request, res: Response) => successResponse(res, getSettings());
