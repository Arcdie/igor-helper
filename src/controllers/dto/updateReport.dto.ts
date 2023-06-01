import { IReport } from '../../interfaces/IReport';

export const updateReportDto = ['listEquipment', 'listSerialNumber', 'comment'];

export class UpdateReportDto {
  listEquipment?: IReport['listEquipment'];
  listSerialNumber?: IReport['listSerialNumber'];
  comment?: IReport['comment'];
}
