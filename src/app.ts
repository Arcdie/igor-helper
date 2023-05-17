import log from './libs/winston';
import { setEnvironment } from './services/app.service';

setEnvironment();

import migrations from './migrations';

import mongoDBConnector from './libs/mongodb';
import expressInitializer from './libs/express';

import config from './config';

(async () => {
  await expressInitializer()
    .then(() => log.info(`Express server running at ${config.app.host}:${config.app.port}`));

  await mongoDBConnector()
    .then(() => log.info('Connection to mongoDB is successful'));

  // await migrations();
})()
  .catch(err => {
    log.error(err);
    process.exit(1);
  });

process.on('uncaughtException', err => {
  console.log(err);
  process.exit(1);
});
