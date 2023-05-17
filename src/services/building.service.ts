import { clearObjectByTargetKeys } from '../libs/helper';

import { isAdmin } from './user.service';

import * as mailService from './mail.service';

import * as buildingRepository from '../repositories/building.repository';

import { IUser } from '../interfaces/IUser';
import { ERole } from '../interfaces/ERole';
import { IBuilding } from '../interfaces/IBuilding';
import { EErrorCode } from '../interfaces/EErrorCode';
import { IFail, ISuccess } from '../interfaces/IResult';
import { EResponseType } from '../interfaces/EResponseType';

import { CreateBuildingDto } from '../controllers/dto/createBuilding.dto';
import { UpdateBuildingDto } from '../controllers/dto/updateBuilding.dto';

export const ALLOWED_FIELDS_TO_CHANGE_FOR_USER = ['name', 'listEquipment'];

export const createBuilding = async (buildingDto: CreateBuildingDto, user: IUser): Promise<IFail | ISuccess<IBuilding>> => {
  const result = await buildingRepository.createBuilding({
    ...buildingDto,
    userId: user._id,
    isReserved: true,
  });

  !result.isReserved ?
    await mailService.mailBuildingCreated(user.email, result) :
    await mailService.mailBuildingCreatedAndReserved(user.email, result)

  return {
    status: true,
    result,
  };
};

export const updateBuilding = async (changes: UpdateBuildingDto, user: IUser, building: IBuilding): Promise<IFail | ISuccess<IBuilding>> => {
  if (!isAdmin(user) && building.userId!.toString() !== user._id!.toString()) {
    return {
      status: false,
      message: EErrorCode.NO_PERMISSIONS,
      responseType: EResponseType.forbiddenResponse,
    };
  }

  if (user.role === ERole.User) {
    changes = clearObjectByTargetKeys(ALLOWED_FIELDS_TO_CHANGE_FOR_USER, changes);
  }

  const result = await buildingRepository.updateBuilding(building, changes);

  if (!result) {
    return {
      status: false,
      message: EErrorCode.NO_RECORD_IN_DB,
      responseType: EResponseType.notFoundResponse,
    };
  }

  await mailService.mailBuildingUpdated(user.email, result);

  return {
    status: true,
    result,
  };
};

export const archiveBuilding = async (user: IUser, building: IBuilding): Promise<IFail | ISuccess<IBuilding>> => {
  if (!isAdmin(user) && building.userId!.toString() !== user._id!.toString()) {
    return {
      status: false,
      message: EErrorCode.NO_PERMISSIONS,
      responseType: EResponseType.forbiddenResponse,
    };
  }

  const result = await buildingRepository.updateBuilding(building, { archivedAt: new Date() });

  if (!result) {
    return {
      status: false,
      message: EErrorCode.NO_RECORD_IN_DB,
      responseType: EResponseType.notFoundResponse,
    };
  }

  await mailService.mailBuildingWasArchived(user.email, result);

  return {
    status: true,
    result,
  };
};
