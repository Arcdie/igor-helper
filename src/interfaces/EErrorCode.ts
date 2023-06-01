export enum EErrorCode {
  EXIST_USER = 'User with this email already exists',
  NO_USER_WITH_THIS_CREDENTIALS = 'No user with this login & password',
  INVALID_AUTH_TOKEN = 'No or invalid auth token',
  INVALID_ID = 'No or invalid id',
  NO_RECORD_IN_DB = 'No record in database',
  NO_PERMISSIONS = 'You do not have enough permissions for this action',
  EMPTY_BODY = 'Body is empty',
  INVALID_BODY = 'Body is invalid',
  ACTIVE_REPORT_EXISTS = 'ACTIVE_REPORT_EXISTS',
  REPORT_PROCESSED = 'REPORT_PROCESSED',
  NO_FILES_IN_BODY = 'NO_FILES_IN_BODY',
  INVALID_FILES = 'INVALID_FILES',
}
