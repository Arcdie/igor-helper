import { IReport } from '../../interfaces/IReport';

export const createReportDto = ['buildingId', 'equipment', 'serialNumber', 'comment'];

export class CreateReportDto {
  buildingId: IReport['buildingId'];
  equipment: IReport['equipment'];
  serialNumber: IReport['serialNumber'];
  comment?: IReport['comment'];
}
