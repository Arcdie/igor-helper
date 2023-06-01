import { EStatus } from '../../interfaces/EStatus';

export class GetBuildingsDto {
  status?: EStatus;
  sortType: 'asc' | 'desc';
}
