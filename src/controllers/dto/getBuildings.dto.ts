import { EStatus } from '../../interfaces/EStatus';
import { regionsUA } from '../../interfaces/ERegions';

export class GetBuildingsDto {
  status?: EStatus;
  isReport?: boolean;
  clientEmail?: string;
  regionName?: typeof regionsUA[number];
  sortType: 'asc' | 'desc';
}
