import constants from '../config/constants';

import {
  getRadians,
  clearObjectByTargetKeys,
} from '../libs/helper';

import { isAdmin } from './user.service';

import * as mailService from './mail.service';

import * as reportRepository from '../repositories/report.repository';
import * as buildingRepository from '../repositories/building.repository';

import { IUser } from '../interfaces/IUser';
import { ERole } from '../interfaces/ERole';
import { IBuilding } from '../interfaces/IBuilding';
import { EErrorCode } from '../interfaces/EErrorCode';
import { IFail, ISuccess } from '../interfaces/IResult';
import { EResponseType } from '../interfaces/EResponseType';

import { CreateBuildingDto } from '../controllers/dto/createBuilding.dto';
import { UpdateBuildingDto } from '../controllers/dto/updateBuilding.dto';

type Point = { lat: number; lng: number }

const getDistanceBetweenPoints = (p1: Point, p2: Point) => {
  const R = 6378137; // Earth’s mean radius in meter
  const dLat = getRadians(p2.lat - p1.lat);
  const dLong = getRadians(p2.lng - p1.lng);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(getRadians(p1.lat)) * Math.cos(getRadians(p2.lat)) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // returns the distance in meter
};

export const ALLOWED_FIELDS_TO_CHANGE_FOR_USER = ['name', 'comment', 'listEquipment'];
export const ALLOWED_FIELDS_TO_CHANGE_FOR_ADMIN = ['name', 'regionName', 'listEquipment', 'lat', 'lng', 'isReserved'];

export const createBuilding = async (buildingDto: CreateBuildingDto, user: IUser): Promise<IFail | ISuccess<IBuilding>> => {
  let isReserved = true;
  const existBuildings = await buildingRepository.findManyBy({});

  if (existBuildings.length) {
    const isDistanceLessThanAllowed = existBuildings.some(
      b => getDistanceBetweenPoints(buildingDto, b) < constants.minDistanceBetweenBuildings
    );

    if (isDistanceLessThanAllowed) {
      isReserved = false;
    }
  }

  const result = await buildingRepository.createBuilding({
    ...buildingDto,
    userId: user._id,
    isReserved,
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
  if (!isAdmin(user)) {
    if (building.userId.toString() !== user._id.toString()) {
      return {
        status: false,
        message: EErrorCode.NO_PERMISSIONS,
        responseType: EResponseType.forbiddenResponse,
      };
    }

    const activeReport = await reportRepository.findOneByBuilding(building);

    if (activeReport) {
      return {
        status: false,
        message: EErrorCode.REPORT_PROCESSED,
        responseType: EResponseType.badRequestResponse,
      };
    }
  }

  changes = clearObjectByTargetKeys(
    user.role === ERole.User ? ALLOWED_FIELDS_TO_CHANGE_FOR_USER : ALLOWED_FIELDS_TO_CHANGE_FOR_ADMIN,
    changes,
  );

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
  if (!isAdmin(user)) {
    if (building.userId.toString() !== user._id.toString()) {
      return {
        status: false,
        message: EErrorCode.NO_PERMISSIONS,
        responseType: EResponseType.forbiddenResponse,
      };
    }

    const activeReport = await reportRepository.findOneByBuilding(building);

    if (activeReport) {
      return {
        status: false,
        message: EErrorCode.REPORT_PROCESSED,
        responseType: EResponseType.badRequestResponse,
      };
    }
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
