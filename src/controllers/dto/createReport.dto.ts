import { IReport } from '../../interfaces/IReport';

export const createReportDto = ['listEquipment', 'listSerialNumber', 'comment?'];

export class CreateReportDto {
  listEquipment: IReport['listEquipment'];
  listSerialNumber: IReport['listSerialNumber'];
  comment?: IReport['comment'];
}
