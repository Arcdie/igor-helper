import { regionsUA } from '../interfaces/ERegions';
import { EErrorCode } from '../interfaces/EErrorCode';

export const getSettings = () => {
  return {
    status: true,
    result: {
      regions: regionsUA,
      errors: EErrorCode,
    },
  }
};
