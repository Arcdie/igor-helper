import mongoose from 'mongoose';

import config from '../config';

const getCommonConnectLink = () => `mongodb://${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.database}`;

export default function () {
  mongoose.set('strictQuery', false);

  return mongoose.connect(
    getCommonConnectLink(),
    config.mongodb.options,
  );
}
