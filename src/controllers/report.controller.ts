import validator from 'validator';
import { Request, Response } from 'express';

import {
  toUTF8,
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
import * as reportService from '../services/report.service';

import * as reportRepository from '../repositories/report.repository';
import * as buildingRepository from '../repositories/building.repository';

import { IUploadFileSchema } from '../interfaces/IUploadFileSchema';
import { EErrorCode } from '../interfaces/EErrorCode';
import { EReportStatus } from '../interfaces/EReportStatus';

import { createReportDto, CreateReportDto } from './dto/createReport.dto';
import { updateReportDto, UpdateReportDto } from './dto/updateReport.dto';

export const getReports = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return unauthorizedResponse(res, EErrorCode.INVALID_AUTH_TOKEN);
  }

  const results = await reportRepository.findManyByUser(user);

  return successResponse(res, {
    status: true,
    result: results,
  });
};

export const getReportByBuilding = async (req: Request, res: Response) => {
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

  if (!isAdmin(user) && user._id.toString() !== building.userId.toString()) {
    return forbiddenResponse(res, EErrorCode.NO_PERMISSIONS);
  }

  const report = await reportRepository.findOneByBuilding(building);

  if (!report) {
    return notFoundResponse(res, EErrorCode.NO_RECORD_IN_DB);
  }

  return successResponse(res, {
    status: true,
    result: report,
  });
};

export const createReport = async (req: Request, res: Response) => {
  const user = req.user;
  const body: CreateReportDto = clearObjectByTargetKeys(createReportDto, req.body);

  const { buildingId }: { buildingId?: string } = req.params;

  if (!user || !user._id) {
    return unauthorizedResponse(res, EErrorCode.INVALID_AUTH_TOKEN);
  }

  if (!buildingId || !validator.isMongoId(buildingId)) {
    return badRequestResponse(res, EErrorCode.INVALID_ID);
  }

  const errors = checkBody(createReportDto, req.body);

  if (errors.length) {
    return badRequestResponse(res, `Немає ${errors.join(', ')} в запиті`);
  }

  const building = await buildingRepository.findOneById(buildingId);

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

  if (isEmptyObject(body)) {
    return badRequestResponse(res, EErrorCode.EMPTY_BODY);
  }

  const report = await reportRepository.findOneById(reportId);

  if (!report) {
    return notFoundResponse(res, EErrorCode.NO_RECORD_IN_DB);
  }

  const result = await reportService.updateReport(body, report, user);

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

export const getReportFiles = async (req: Request, res: Response) => {
  const user = req.user;
  const { reportId }: { reportId?: string } = req.params;

  if (!user || !user._id) {
    return unauthorizedResponse(res, EErrorCode.INVALID_AUTH_TOKEN);
  }

  if (!reportId || !validator.isMongoId(reportId)) {
    return badRequestResponse(res, EErrorCode.INVALID_ID);
  }

  const report = await reportRepository.findOneById(reportId);

  if (!report) {
    return notFoundResponse(res, EErrorCode.NO_RECORD_IN_DB);
  }

  const result = await reportService.getReportFiles(report, user);

  if (!result.status) {
    return dynamicResponse(result.responseType)(res, result.message);
  }

  return successResponse(res, result);
};

export const updateFilesInReport = async (req: Request, res: Response) => {
  const user = req.user;
  const files = req.files as Express.Multer.File[];
  const { filesInfo }: { filesInfo: string } = req.body;
  const { reportId }: { reportId?: string } = req.params;

  // todo: fileSize limit

  if (!user || !user._id) {
    return unauthorizedResponse(res, EErrorCode.INVALID_AUTH_TOKEN);
  }

  if (!reportId || !validator.isMongoId(reportId)) {
    return badRequestResponse(res, EErrorCode.INVALID_ID);
  }

  if (filesInfo && !validator.isJSON(filesInfo)) {
    return badRequestResponse(res, EErrorCode.INVALID_BODY);
  }

  const report = await reportRepository.findOneById(reportId);

  if (!report) {
    return notFoundResponse(res, EErrorCode.NO_RECORD_IN_DB);
  }

  let filesSchema: IUploadFileSchema[] = [];

  if (filesInfo) {
    filesSchema = JSON.parse(filesInfo);

    let isClear = true;

    filesSchema
      .filter(e => e.isNew)
      .forEach(e => {
        e.file = files.find(f => toUTF8(f.originalname) === e.fileId);

        if (!e.file) {
          isClear = false;
        }
      });

    if (!isClear) {
      return badRequestResponse(res, EErrorCode.NO_FILES_IN_BODY);
    }
  }

  const result = await reportService.updateFilesInReport(filesSchema, report, user);

  if (!result.status) {
    return dynamicResponse(result.responseType)(res, result.message);
  }

  return successResponse(res, result);
}
