import validator from 'validator';
import { Request, Response } from 'express';

import {
  checkBody,
  isEmptyObject,
  clearObjectByTargetKeys,
} from '../libs/helper';

import {
  dynamicResponse,
  successResponse,
  notFoundResponse,
  badRequestResponse,
  unauthorizedResponse,
} from '../libs/expressResponses';

import * as buildingService from '../services/building.service';
import * as buildingRepository from '../repositories/building.repository';

import { regionsUA } from '../interfaces/ERegions';
import { EErrorCode } from '../interfaces/EErrorCode';

import { createBuildingDto, CreateBuildingDto } from './dto/createBuilding.dto';
import { updateBuildingDto, UpdateBuildingDto } from './dto/updateBuilding.dto';

export const getBuildings = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return unauthorizedResponse(res, EErrorCode.INVALID_AUTH_TOKEN);
  }

  const result = await buildingRepository.findManyByUser(user);

  return successResponse(res, result);
};

export const createBuilding = async (req: Request, res: Response) => {
  const user = req.user;
  const body: CreateBuildingDto = clearObjectByTargetKeys(createBuildingDto, req.body);

  if (!user) {
    return unauthorizedResponse(res, EErrorCode.INVALID_AUTH_TOKEN);
  }

  const errors = checkBody(createBuildingDto, req.body);

  if (errors.length) {
    return badRequestResponse(res, `No ${errors.join(', ')}`);
  }

  if (!regionsUA.includes(body.regionName)) {
    return badRequestResponse(res, 'Invalid region');
  }

  if (body.listEquipment) {
    if (!Array.isArray(body.listEquipment)) {
      return badRequestResponse(res, 'Invalid listEquipment');
    }

    const isValid = !body.listEquipment.some(e => typeof e !== 'string');

    if (!isValid) {
      return badRequestResponse(res, 'Invalid listEquipment');
    }
  }

  const result = await buildingService.createBuilding(body, user);

  if (!result.status) {
    return dynamicResponse(result.responseType)(res, result.message);
  }

  return successResponse(res, result);
};

export const updateBuilding = async (req: Request, res: Response) => {
  const user = req.user;
  const { buildingId }: { buildingId?: string } = req.params;
  const body: UpdateBuildingDto = clearObjectByTargetKeys(updateBuildingDto, req.body);

  if (!user || !user._id) {
    return unauthorizedResponse(res, EErrorCode.INVALID_AUTH_TOKEN);
  }

  if (!buildingId || !validator.isMongoId(buildingId)) {
    return badRequestResponse(res, EErrorCode.INVALID_ID);
  }

  if (!isEmptyObject(body)) {
    return badRequestResponse(res, EErrorCode.EMPTY_BODY);
  }

  if (body.regionName && !regionsUA.includes(body.regionName)) {
    return badRequestResponse(res, 'Invalid region');
  }

  const building = await buildingRepository.findOneById(buildingId);

  if (!building) {
    return notFoundResponse(res, EErrorCode.NO_RECORD_IN_DB);
  }

  const result = await buildingService.updateBuilding(body, user, building);

  if (!result.status) {
    return dynamicResponse(result.responseType)(res, result.message);
  }

  return successResponse(res, result);
};

export const archiveBuilding = async (req: Request, res: Response) => {
  const user = req.user;
  const { buildingId }: { buildingId?: string } = req.params;

  if (!user || !user._id) {
    return unauthorizedResponse(res, EErrorCode.INVALID_AUTH_TOKEN);
  }

  if (!buildingId || !validator.isMongoId(buildingId)) {
    return badRequestResponse(res, EErrorCode.INVALID_ID);
  }

  const building = await buildingRepository.findOneById(buildingId);

  if (!building) {
    return notFoundResponse(res, EErrorCode.NO_RECORD_IN_DB);
  }

  const result = await buildingService.archiveBuilding(user, building);

  if (!result.status) {
    return dynamicResponse(result.responseType)(res, result.message);
  }

  return successResponse(res, result);
};
