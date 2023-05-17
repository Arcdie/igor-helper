import { IReport } from '../../interfaces/IReport';

export const updateReportDto = ['equipment', 'serialNumber', 'comment'];

export class UpdateReportDto {
  equipment: IReport['equipment'];
  serialNumber: IReport['serialNumber'];
  comment?: IReport['comment'];
}
