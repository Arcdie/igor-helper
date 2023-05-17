import { clearObjectByTargetKeys } from '../libs/helper';

import { isAdmin } from './user.service';
import * as reportRepository from '../repositories/report.repository';

import { ERole } from '../interfaces/ERole';
import { IUser } from '../interfaces/IUser';
import { IReport } from '../interfaces/IReport';
import { IBuilding } from '../interfaces/IBuilding';
import { EErrorCode } from '../interfaces/EErrorCode';
import { IFail, ISuccess } from '../interfaces/IResult';
import { EReportStatus } from '../interfaces/EReportStatus';
import { EResponseType } from '../interfaces/EResponseType';

import { CreateReportDto } from '../controllers/dto/createReport.dto';
import { UpdateReportDto } from '../controllers/dto/updateReport.dto';

export const ALLOWED_FIELDS_TO_CHANGE_FOR_USER = ['equipment', 'serialNumber'];

export const createReport = async (reportDto: CreateReportDto, user: IUser, building: IBuilding): Promise<IFail | ISuccess<IReport>> => {
  if (!isAdmin(user) && building.userId.toString() !== user._id.toString()) {
    return {
      status: false,
      message: EErrorCode.NO_PERMISSIONS,
      responseType: EResponseType.forbiddenResponse,
    };
  }

  const doesExistActive = await reportRepository.findActiveByBuilding(building);

  if (doesExistActive) {
    return {
      status: false,
      message: EErrorCode.ACTIVE_REPORT_EXISTS,
      responseType: EResponseType.badRequestResponse,
    };
  }

  const result = await reportRepository.createReport({
    ...reportDto,
    userId: user._id,
    buildingId: building._id,
    status: EReportStatus.InProcess,
  });

  return {
    status: true,
    result,
  };
};

export const changeReport = async (changes: UpdateReportDto, report: IReport, user: IUser): Promise<IFail | ISuccess<IReport>> => {
  if (report.userId.toString() !== user._id.toString()) {
    return {
      status: false,
      message: EErrorCode.NO_PERMISSIONS,
      responseType: EResponseType.forbiddenResponse,
    };
  }

  if (user.role === ERole.User) {
    changes = clearObjectByTargetKeys(ALLOWED_FIELDS_TO_CHANGE_FOR_USER, changes);
  }

  const result = await reportRepository.updateReport(report, changes);

  if (!result) {
    return {
      status: false,
      message: EErrorCode.NO_RECORD_IN_DB,
      responseType: EResponseType.notFoundResponse,
    };
  }

  return {
    status: true,
    result,
  };
};

export const changeReportStatus = async (newStatus: EReportStatus, report: IReport, user: IUser): Promise<IFail | ISuccess<IReport>> => {
  if (!isAdmin(user)) {
    return {
      status: false,
      message: EErrorCode.NO_PERMISSIONS,
      responseType: EResponseType.forbiddenResponse,
    };
  }

  const result = await reportRepository.updateReport(report, { status: newStatus });

  if (!result) {
    return {
      status: false,
      message: EErrorCode.NO_RECORD_IN_DB,
      responseType: EResponseType.notFoundResponse,
    };
  }

  return {
    status: true,
    result,
  };
};
