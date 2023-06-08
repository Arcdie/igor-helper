export enum EErrorCode {
  INVALID_STATUS = 'Передано невалідний статус',
  INVALID_EMAIL = 'Передано невалідний email',
  INVALID_PASSWORD = 'Пароль має містити хоча б 6 символів',
  INVALID_IS_REPORT = 'Передано невалідний параметр наявності звіту',
  INVALID_REGION = 'Передано невалідна назву регіону',
  INVALID_SORT_TYPE = 'Передано невалідний тип сортування',

  NO_USER_WITH_THIS_CREDENTIALS = 'В системі немає користувача з таким email та паролем',
  EXIST_USER = 'Користувач з таким email вже зареєстрований',
  INVALID_AUTH_TOKEN = 'Немає або невалідний токен авторизації',
  INVALID_ID = 'Невалідний id',
  NO_RECORD_IN_DB = 'Не можу знайти запис',
  NO_PERMISSIONS = 'У вас немає прав для виконання цього запиту',
  EMPTY_BODY = 'Тіло запиту порожнє',
  INVALID_BODY = 'Тіло запиту невалідне',
  NO_FILES_IN_BODY = 'Не передані файли',
  INVALID_FILES = 'Передані файли невалідні',

  ACTIVE_REPORT_EXISTS = 'Не можу створити звіт, оскільки ще існує активний',
  REPORT_PROCESSED = 'Редагування звіту можливо тільки якщо він у статусі Обробка',
}
