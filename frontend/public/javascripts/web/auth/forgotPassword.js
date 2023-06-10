/* global
functions, addAlert, getUnix, getSettings, sendPostRequest, isValidEmail,
objects, validator
*/

/* Constants */

const URL_RESTORE_PASSWORD = '/auth/forgotPassword';

/* Variables */

/* JQuery */

const $email = $('input#email');

const $restore = $('button#restore');

$(document).ready(async () => {
  const settings = await getSettings();

  if (!settings) {
    return false;
  }

  $restore
    .on('click', async () => {
      const nowUnix = getUnix();
      const email = $email.val();
      let lastRestoreTime = localStorage.getItem('lastTimeRestorePasswordMail');

      if (lastRestoreTime) {
        lastRestoreTime = parseInt(lastRestoreTime, 10);

        if (nowUnix - lastRestoreTime < settings.constants.intervalBetweenRestorePasswordMail) {
          addAlert('warning', 'Ви досягли ліміту на відправку листа с паролем. Спробуйте ще раз через 10 хвилин.');
          return false;
        }
      }

      const validationClassName = 'is-invalid';

      email ? $email.removeClass(validationClassName) : $email.addClass(validationClassName);

      const result = await sendPostRequest(URL_RESTORE_PASSWORD, { email });

      if (!result) {
        return false;
      }

      addAlert('sucess', 'Лист з паролем був відправлений на вашу пошту');
      localStorage.setItem('lastTimeRestorePasswordMail', nowUnix);
    });
});
