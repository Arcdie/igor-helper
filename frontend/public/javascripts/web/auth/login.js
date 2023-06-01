/* global
functions, sendPostRequest, isValidEmail,
objects, validator
*/

/* Constants */

const URL_LOGIN_USER = '/auth/login';

/* Variables *

/* JQuery */

const $email = $('input#email');
const $password = $('input#password');

const $login = $('button#login');

$(document).ready(async () => {
  $login
    .on('click', async () => {
      const email = $email.val();
      const password = $password.val();

      const validationClassName = 'is-invalid';

      email ? $email.removeClass(validationClassName) : $email.addClass(validationClassName);
      password ? $password.removeClass(validationClassName) : $password.addClass(validationClassName);

      const result = await sendPostRequest(URL_LOGIN_USER, { email, password });

      if (!result) {
        return false;
      }

      location.href = '/';
    });
});
