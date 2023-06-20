import { regionsUA } from '../interfaces/ERegions';
import { EErrorCode } from '../interfaces/EErrorCode';

import config from '../config';
import constants from '../config/constants';

export const getSettings = () => {
  return {
    status: true,
    result: {
      constants,
      regions: regionsUA,
      errors: EErrorCode,
      config: {
        google: {
          apikey: config.google.apikey,
        }
      },
    },
  }
};
