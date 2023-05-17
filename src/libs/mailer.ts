import sendgrid from '@sendgrid/mail';

import config from '../config';

import log from './winston';

import { IMailBody } from '../interfaces/IMailBody';

sendgrid.setApiKey(config.sendgrid.apikey);

const generateMailBody = (mailBody: IMailBody) => ({
  to: mailBody.to,
  text: mailBody.message,
  subject: mailBody.subject,
  from: config.sendgrid.from,
});

export const sendEmail = async (mailBody: IMailBody) => {
  const fullMessage = generateMailBody(mailBody);

  try {
    const result = await sendgrid.send(fullMessage);

    if (!result || !result[0] || result[0].statusCode !== 202) {
      log.warn(`Can't send message: ${mailBody.message} to: ${mailBody.to}`);
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    log.warn(`Can't send message: ${mailBody.message} to: ${mailBody.to}`);
    console.log(JSON.stringify(error, null, 2));
  }
};
