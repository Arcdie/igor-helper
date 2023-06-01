import { IBuilding } from '../../interfaces/IBuilding';

export const updateBuildingDto = ['name', 'regionName', 'listEquipment', 'lat', 'lng', 'isReserved', 'comment'];

export interface UpdateBuildingDto {
  name?: IBuilding['name'];
  regionName?: IBuilding['regionName'];
  listEquipment?: IBuilding['listEquipment'];
  lat?: IBuilding['lat'];
  lng?: IBuilding['lng'];
  comment?: IBuilding['comment'];
  isReserved?: IBuilding['isReserved'];
}
