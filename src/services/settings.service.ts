import { regionsUA } from '../interfaces/ERegions';

import constants from '../config/constants';

export const getSettings = () => {
  return {
    status: true,
    result: {
      constants,
      regions: regionsUA,
    },
  }
};
