import path from 'path';
import dotenv from 'dotenv';

export const getEnvironment = () => process.env.NODE_ENV;

export const setEnvironment = () => {
  const fileEnv = process.env.PWD === `/home/ivalentyn/www/igor-helper`
    ? 'production' : 'development';

  const envPath = path.join(__dirname, '../../.development.env');
  dotenv.config({ path: envPath });
};
