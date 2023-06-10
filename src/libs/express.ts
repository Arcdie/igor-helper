import path from 'path';
import { Server } from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express, { Express, Response, ErrorRequestHandler } from 'express';

import config from '../config';
import routes from '../routes';
import morgan from '../middlewares/morgan.middleware';

import { getEnv } from './helper';

const initExpress = () => express();

const useRoutes = (expressApp: Express) => {
  expressApp.use('/', routes);
  return expressApp;
};

const useMiddlewares = (expressApp: Express) => {
  const frontFolder = path.join(__dirname, '../../frontend');

  expressApp.set('views', `${frontFolder}/views`);
  expressApp.set('view engine', 'pug');

  expressApp.use(bodyParser.json({}));
  expressApp.use(bodyParser.urlencoded({ extended: false }));

  expressApp.use(express.static(`${frontFolder}/public`));
  expressApp.use(cookieParser());

  if (!['production', 'test'].includes(getEnv())) {
    expressApp.use(morgan);
  }

  return expressApp;
};

const useErrorsHandling = (expressApp: Express) => {
  const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.log(err);
    res.sendStatus(500);
  };

  expressApp.use((req, res) => res.sendStatus(404));
  expressApp.use(errorHandler);

  return expressApp;
};

const listen = (expressApp: Express): Promise<Server> => new Promise(res => {
  const server = expressApp.listen(config.app.port, config.app.host, () => res(server));
});

const init = () => {
  const expressApp = initExpress();
  useMiddlewares(expressApp);
  useRoutes(expressApp);
  useErrorsHandling(expressApp);

  return listen(expressApp);
};

export default init;

export const setAuthCookies = (res: Response, token: string) => {
  res.cookie('Authorization', token, {
    httpOnly: true,
    maxAge: config.app.cookieLifetime,
  });
};

export const removeAuthCookies = (res: Response) => {
  res.clearCookie('Authorization');
};
