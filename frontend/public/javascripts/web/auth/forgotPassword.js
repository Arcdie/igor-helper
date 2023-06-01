/* global
functions, addAlert, sendPostRequest, isValidEmail,
objects, validator
*/

/* Constants */

const URL_RESTORE_PASSWORD = '/auth/forgotPassword';

/* Variables *

/* JQuery */

const $email = $('input#email');

const $restore = $('button#restore');

$(document).ready(async () => {
  $restore
    .on('click', async () => {
      const email = $email.val();

      const validationClassName = 'is-invalid';

      email ? $email.removeClass(validationClassName) : $email.addClass(validationClassName);

      const result = await sendPostRequest(URL_RESTORE_PASSWORD, { email });

      if (!result) {
        return false;
      }

      addAlert('sucess', 'Лист з паролем був відправлений на вашу пошту');
      // todo: prevent spam sents
    });
});
