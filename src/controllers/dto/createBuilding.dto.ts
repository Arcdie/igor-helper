import { IBuilding } from '../../interfaces/IBuilding';

export const createBuildingDto = ['name', 'regionName', 'listEquipment', 'lat', 'lng', 'comment?'];

// todo: forbid add fields which don't exist in allowedBody, make it pretier
// export class CreateBuildingDto implements Record<typeof createBuildingDto[number], any>  {

export class CreateBuildingDto {
  name: IBuilding['name'];
  regionName: IBuilding['regionName'];
  listEquipment: IBuilding['listEquipment'];
  lat: IBuilding['lat'];
  lng: IBuilding['lng'];
  comment?: IBuilding['comment'];
}
