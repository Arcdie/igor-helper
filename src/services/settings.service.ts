import { regionsUA } from '../interfaces/ERegions';

export const getSettings = () => {
  return {
    status: true,
    result: {
      regions: regionsUA,
    },
  }
};
