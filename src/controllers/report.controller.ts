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

import * as reportService from '../services/report.service';
import * as reportRepository from '../repositories/report.repository';
import * as buildingRepository from '../repositories/building.repository';

import { EErrorCode } from '../interfaces/EErrorCode';
import { EReportStatus } from '../interfaces/EReportStatus';

import { createReportDto, CreateReportDto } from './dto/createReport.dto';
import { updateReportDto, UpdateReportDto } from './dto/updateReport.dto';

export const getReports = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return unauthorizedResponse(res, EErrorCode.INVALID_AUTH_TOKEN);
  }

  const result = await reportRepository.findManyByUser(user);
  return successResponse(res, result);
};

export const createReport = async (req: Request, res: Response) => {
  const user = req.user;
  const body: CreateReportDto = clearObjectByTargetKeys(createReportDto, req.body);

  if (!user || !user._id) {
    return unauthorizedResponse(res, EErrorCode.INVALID_AUTH_TOKEN);
  }

  const errors = checkBody(createReportDto, req.body);

  if (errors.length) {
    return badRequestResponse(res, `No ${errors.join(', ')}`);
  }

  if (!validator.isMongoId(body.buildingId)) {
    return badRequestResponse(res, EErrorCode.INVALID_ID);
  }

  const building = await buildingRepository.findOneById(body.buildingId);

  if (!building) {
    return notFoundResponse(res, EErrorCode.NO_RECORD_IN_DB);
  }

  const result = await reportService.createReport(body, user, building);

  if (!result.status) {
    return badRequestResponse(res, result.message);
  }

  return successResponse(res, result);
};

export const updateReport = async (req: Request, res: Response) => {
  const user = req.user;
  const { reportId }: { reportId?: string } = req.params;
  const body: UpdateReportDto = clearObjectByTargetKeys(updateReportDto, req.body);

  if (!user || !user._id) {
    return unauthorizedResponse(res, EErrorCode.INVALID_AUTH_TOKEN);
  }

  if (!reportId || !validator.isMongoId(reportId)) {
    return badRequestResponse(res, EErrorCode.INVALID_ID);
  }

  if (!isEmptyObject(body)) {
    return badRequestResponse(res, EErrorCode.EMPTY_BODY);
  }

  const report = await reportRepository.findOneById(reportId);

  if (!report) {
    return notFoundResponse(res, EErrorCode.NO_RECORD_IN_DB);
  }

  const result = await reportService.changeReport(body, report, user);

  if (!result.status) {
    return dynamicResponse(result.responseType)(res, result.message);
  }

  return successResponse(res, result);
};

export const updateReportStatus = async (req: Request, res: Response) => {
  const user = req.user;
  const { status }: { status: EReportStatus } = req.body;
  const { reportId }: { reportId?: string } = req.params;

  if (!user || !user._id) {
    return unauthorizedResponse(res, EErrorCode.INVALID_AUTH_TOKEN);
  }

  if (!reportId || !validator.isMongoId(reportId)) {
    return badRequestResponse(res, EErrorCode.INVALID_ID);
  }

  if (!status || !Object.values(EReportStatus).includes(status)) {
    return badRequestResponse(res, EErrorCode.INVALID_BODY);
  }

  const report = await reportRepository.findOneById(reportId);

  if (!report) {
    return notFoundResponse(res, EErrorCode.NO_RECORD_IN_DB);
  }

  const result = await reportService.changeReportStatus(status, report, user);

  if (!result.status) {
    return dynamicResponse(result.responseType)(res, result.message);
  }

  return successResponse(res, result);
};
