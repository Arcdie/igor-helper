import { sendEmail } from '../libs/mailer';

import { IBuilding } from '../interfaces/IBuilding';

/* Users */
export const mailAccountCreated = (to: string) => sendEmail({
  to, subject: 'Аккаунт створено',
  message: 'Аккаунт був успішно створений.',
});

export const mailSendPassword = (to: string, password: string) => sendEmail({
  to, subject: 'Відновлення паролю',
  message: `Пароль для входу в аккаунт: ${password}`,
});

/* Buildings */
export const mailBuildingCreated = (to: string, building: IBuilding) => sendEmail({
  to, subject: `Обʼєкт ${building.name} було створено`,
  message: `Обʼєкт ${building.name} було створено, але не зарезервовано. Зверніться до менеджера.`,
});

export const mailBuildingCreatedAndReserved = (to: string, building: IBuilding) => sendEmail({
  to, subject: `Обʼєкт ${building.name} було створено та зарезервовано`,
  message: `Обʼєкт ${building.name} було створено та зарезервовано`,
});

export const mailBuildingUpdated = (to: string, building: IBuilding) => sendEmail({
  to, subject: `Обʼєкт ${building.name} було оновлено`,
  message: `Обʼєкт ${building.name} було оновлено.`,
});

export const mailBuildingWasArchived = (to: string, building: IBuilding) => sendEmail({
  to, subject: `Обʼєкт ${building.name} був видалений`,
  message: `Обʼєкт ${building.name} був видалений`,
});

/*
export const mailBuildingUpdatedStatus = (to: string, building: IBuilding) => sendEmail({
  to, subject: `Змінився статус для обʼєкт ${building.name},`,
  message: `Статус для обʼєкту ${building.name} встановлений як ${building.status}.`,
});
*/

/* Reports */




