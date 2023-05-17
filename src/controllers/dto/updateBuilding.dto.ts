import { IBuilding } from '../../interfaces/IBuilding';

export const updateBuildingDto = ['name', 'regionName', 'listEquipment', 'x', 'y', 'isReserved', 'comment'];

export interface UpdateBuildingDto {
  name?: IBuilding['name'];
  regionName?: IBuilding['regionName'];
  listEquipment?: IBuilding['listEquipment'];
  x?: IBuilding['x'];
  y?: IBuilding['y'];
  comment?: IBuilding['comment'];
  isReserved?: IBuilding['isReserved'];
}
