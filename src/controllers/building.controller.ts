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
  forbiddenResponse,
  badRequestResponse,
  unauthorizedResponse,
} from '../libs/expressResponses';

import { isAdmin } from '../services/user.service';
import * as buildingService from '../services/building.service';

import * as reportRepository from '../repositories/report.repository';
import * as buildingRepository from '../repositories/building.repository';

import { IUser } from '../interfaces/IUser';
import { IReport } from '../interfaces/IReport';
import { IBuilding } from '../interfaces/IBuilding';

import { EStatus } from '../interfaces/EStatus';
import { regionsUA } from '../interfaces/ERegions';
import { EErrorCode } from '../interfaces/EErrorCode';
import { EReportStatus } from '../interfaces/EReportStatus';

import { GetBuildingsDto } from './dto/getBuildings.dto';
import { createBuildingDto, CreateBuildingDto } from './dto/createBuilding.dto';
import { updateBuildingDto, UpdateBuildingDto } from './dto/updateBuilding.dto';

export const getBuildingById = async (req: Request, res: Response) => {
  const user = req.user;
  const { buildingId }: { buildingId?: string } = req.params;

  if (!user || !user._id) {
    return unauthorizedResponse(res, EErrorCode.INVALID_AUTH_TOKEN);
  }

  if (!buildingId || !validator.isMongoId(buildingId)) {
    return badRequestResponse(res, EErrorCode.INVALID_ID);
  }

  const result = await buildingRepository.findOneById(buildingId);

  if (!result) {
    return notFoundResponse(res, EErrorCode.NO_RECORD_IN_DB);
  }

  if (!isAdmin(user) && user._id.toString() !== result.userId.toString()) {
    return forbiddenResponse(res, EErrorCode.NO_PERMISSIONS);
  }

  return successResponse(res, {
    status: true,
    result,
  });
};

export const getBuildings = async (req: { user: IUser, query: GetBuildingsDto }, res: Response) => {
  const user = req.user;
  let { status, sortType } = req.query;

  if (!user) {
    return unauthorizedResponse(res, EErrorCode.INVALID_AUTH_TOKEN);
  }

  if (!sortType || !['asc', 'desc'].includes(sortType)) {
    return badRequestResponse(res, 'Invalid sortType');
  }

  if (status && !Object.values(EStatus).includes(+status)) {
    return badRequestResponse(res, 'Invalid status');
  }
  
  const buildings = await buildingRepository.findManyByUser(user, {}, sortType);
  const reports = await reportRepository.findManyByBuildings(buildings);  

  let results = buildings.map(b => ({
    ...b,
    report: reports.find(r => r?.buildingId.toString() === b._id.toString()),
  }));

  if (status) {
    switch (+status) {
      case EStatus.Created: results = results.filter(b => !b.isReserved); break;
      case EStatus.Reserved: results = results.filter(b => b.isReserved); break;
      case EStatus.InProcess: results = results.filter(b => b.report?.status === EReportStatus.InProcess); break;
      case EStatus.Approved: results = results.filter(b => b.report?.status === EReportStatus.Approved); break;
      case EStatus.Rejeted: results = results.filter(b => b.report?.status === EReportStatus.Rejeted); break;
    }
  }

  return successResponse(res, {
    status: true,
    result: results,
  });
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

  if (isEmptyObject(body)) {
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
