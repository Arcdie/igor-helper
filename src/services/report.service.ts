import * as s3Lib from '../libs/aws/s3';
import { clearObjectByTargetKeys } from '../libs/helper';

import { isAdmin } from './user.service';
import * as mailService from './mail.service';
import * as fileService from './file.service';

import * as fileRepository from '../repositories/file.repository';
import * as reportRepository from '../repositories/report.repository';
import * as buildingRepository from '../repositories/building.repository';
import * as reportFileBoundRepository from '../repositories/reportFileBound.repository';

import { IUser } from '../interfaces/IUser';
import { IFile } from '../interfaces/IFile';
import { IReport } from '../interfaces/IReport';
import { IBuilding } from '../interfaces/IBuilding';
import { IFail, ISuccess } from '../interfaces/IResult';
import { IUploadFileSchema } from '../interfaces/IUploadFileSchema';
import { EErrorCode } from '../interfaces/EErrorCode';
import { EReportStatus } from '../interfaces/EReportStatus';
import { EResponseType } from '../interfaces/EResponseType';

import { CreateReportDto } from '../controllers/dto/createReport.dto';
import { UpdateReportDto } from '../controllers/dto/updateReport.dto';

export const ALLOWED_FIELDS_TO_CHANGE_FOR_ADMIN = ['status'];
export const ALLOWED_FIELDS_TO_CHANGE_FOR_USER = ['equipment', 'serialNumber', 'comment'];

export const createReport = async (
  reportDto: CreateReportDto,
  user: IUser,
  building: IBuilding,
): Promise<IFail | ISuccess<IReport>> => {
  if (building.userId.toString() !== user._id.toString()) {
    return {
      status: false,
      message: EErrorCode.NO_PERMISSIONS,
      responseType: EResponseType.forbiddenResponse,
    };
  }

  const doesExistActive = await reportRepository.findOneByBuilding(building);

  if (doesExistActive) {
    return {
      status: false,
      message: EErrorCode.ACTIVE_REPORT_EXISTS,
      responseType: EResponseType.badRequestResponse,
    };
  }

  const resultCreate = await reportRepository.createReport({
    ...reportDto,
    userId: user._id,
    buildingId: building._id,
    status: EReportStatus.InProcess,
  });

  await mailService.mailReportCreated(user.email, building);

  return {
    status: true,
    result: resultCreate,
  };
};

export const updateReport = async (changes: UpdateReportDto, report: IReport, user: IUser): Promise<IFail | ISuccess<IReport>> => {
  if (report.userId.toString() !== user._id.toString()) {
    return {
      status: false,
      message: EErrorCode.NO_PERMISSIONS,
      responseType: EResponseType.forbiddenResponse,
    };
  }

  if (report.status !== EReportStatus.InProcess) {
    return {
      status: false,
      message: EErrorCode.REPORT_PROCESSED,
      responseType: EResponseType.badRequestResponse,
    };
  }

  changes = clearObjectByTargetKeys(ALLOWED_FIELDS_TO_CHANGE_FOR_USER, changes);

  const building = await buildingRepository.findOneById(report.buildingId);

  if (!building) {
    return {
      status: false,
      message: EErrorCode.NO_RECORD_IN_DB,
      responseType: EResponseType.notFoundResponse,
    };
  }

  const result = await reportRepository.updateReport(report, changes);

  if (!result) {
    return {
      status: false,
      message: EErrorCode.NO_RECORD_IN_DB,
      responseType: EResponseType.notFoundResponse,
    };
  }

  await mailService.mailReportChanged(user.email, building);

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

  const building = await buildingRepository.findOneById(report.buildingId);

  if (!building) {
    return {
      status: false,
      message: EErrorCode.NO_RECORD_IN_DB,
      responseType: EResponseType.notFoundResponse,
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

  await mailService.mailReportStatusChanged(user.email, building);

  return {
    status: true,
    result,
  };
};

type getReportFilesReturnType = IFile & { link: string };
export const getReportFiles = async (report: IReport, user: IUser): Promise<IFail | ISuccess<getReportFilesReturnType[]>> => {
  if (!isAdmin(user) && report.userId.toString() !== user._id.toString()) {
    return {
      status: false,
      message: EErrorCode.NO_PERMISSIONS,
      responseType: EResponseType.forbiddenResponse,
    };
  }

  const bounds = await reportFileBoundRepository.findManyByReport(report);

  if (!bounds || !bounds.length) {
    return {
      status: true,
      result: [],
    };
  }

  const fileIds = bounds.map(b => b.fileId);
  const files = await fileRepository.findManyByIds(fileIds);

  return {
    status: true,
    result: files.map(f => ({
      ...f,
      link: `${s3Lib.getBucketLink()}/${f.name}.${f.extentionType}`,
    })),
  }
};

export const updateFilesInReport = async (files: IUploadFileSchema[], report: IReport, user: IUser): Promise<IFail | { status: true }> => {
  if (report.status !== EReportStatus.InProcess) {
    return {
      status: false,
      message: EErrorCode.REPORT_PROCESSED,
      responseType: EResponseType.badRequestResponse,
    };
  }

  const existReportFileBounds = await reportFileBoundRepository.findManyByReport(report);

  const filesToAdd = files.filter(f => f.isNew);
  const boundsToRemove = existReportFileBounds.filter(b => !files.some(f => f.fileId === b.fileId.toString()));

  if (filesToAdd.length) {
    await Promise.all(filesToAdd.map(async fileSchema => {
      const savedFile = await fileService.uploadFile(fileSchema.file!, user);

      await reportFileBoundRepository.createReportFileBound({
        reportId: report._id,
        fileId: savedFile._id,
      });
    }));
  }

  if (boundsToRemove.length) {
    const existFiles = await fileRepository.findManyByIds(existReportFileBounds.map(b => b.fileId));
    await reportFileBoundRepository.removeReportFileBoundsByBounds(boundsToRemove);

    await Promise.all(boundsToRemove.map(async bound => {
      const file = existFiles.find(f => f._id.toString() === bound.fileId.toString());
      await fileService.removeFile(file!);
    }));
  }

  return {
    status: true,
  };
};

// @deprecated
export const updateFilesInReportOld = async (files: Express.Multer.File[], report: IReport, user: IUser): Promise<IFail | { status: true }> => {
  if (report.status !== EReportStatus.InProcess) {
    return {
      status: false,
      message: EErrorCode.REPORT_PROCESSED,
      responseType: EResponseType.badRequestResponse,
    };
  }

  let existFiles: IFile[] = [];
  const existReportFileBounds = await reportFileBoundRepository.findManyByReport(report);

  if (existReportFileBounds.length) {
    existFiles = await fileRepository.findManyByIds(
      existReportFileBounds.map(b => b.fileId),
    );

    const boundsToRemove = existReportFileBounds.filter(bound => {
      const file = existFiles.find(f => f._id.toString() === bound._id.toString());

      if (!file) {
        return true;
      }

      const doesExistInLoadingFiles = files.find(f => f.originalname === file.originalName);

      if (!doesExistInLoadingFiles || doesExistInLoadingFiles.size !== file.size) {
        return true;
      }
    });

    if (boundsToRemove.length) {
      await reportFileBoundRepository.removeReportFileBoundsByBounds(boundsToRemove);

      await Promise.all(boundsToRemove.map(async bound => {
        const file = existFiles.find(f => f._id.toString() === bound._id.toString());
        await fileRepository.removeFile(file!);
      }));
    }
  }

  const filesToAdd = files.filter(file =>
    !existFiles.some(f => file.originalname === f.originalName && file.size === f.size)
  );

  if (filesToAdd.length) {
    await Promise.all(filesToAdd.map(async file => {
      const savedFile = await fileService.uploadFile(file, user);

      await reportFileBoundRepository.createReportFileBound({
        reportId: report._id,
        fileId: savedFile._id,
      });
    }));
  }

  return {
    status: true,
  };
};

// @deprecated
export const attachFileToReport = async (file: Express.Multer.File, report: IReport, user: IUser): Promise<IFail | ISuccess<IFile>> => {
  if (report.status !== EReportStatus.InProcess) {
    return {
      status: false,
      message: EErrorCode.REPORT_PROCESSED,
      responseType: EResponseType.badRequestResponse,
    };
  }

  const savedFile = await fileService.uploadFile(file, user);

  await reportFileBoundRepository.createReportFileBound({
    reportId: report._id,
    fileId: savedFile._id,
  });

  return {
    status: true,
    result: savedFile,
  };
};
