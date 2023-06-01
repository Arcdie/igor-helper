/* global
functions, sendPostRequest, isValidEmail,
objects, validator,
vars, validationClassName,
*/

/* Constants */

const URL_REGISTER_USER = '/auth/registration';

/* Variables *

/* JQuery */
const $name = $('input#name');
const $email = $('input#email');
const $password = $('input#password');
const $companyName = $('input#companyName');
const $phoneNumber = $('input#phoneNumber'); // todo: add mask
const $providerName = $('input#providerName');

const $register = $('button#register');

$(document).ready(async () => {
  $register
    .on('click', async () => {
      const name = $name.val();
      const email = $email.val();
      const password = $password.val();
      const companyName = $companyName.val();
      const phoneNumber = $phoneNumber.val();
      const providerName = $providerName.val();

      let isValid = true;

      [$name, $companyName, $phoneNumber, $providerName].forEach($e => {
        const value = $e.val();

        if (!value) {
          isValid = false;
          $e.addClass(validationClassName);
        } else {
          $e.removeClass(validationClassName)
        }
      });

      // todo: check
      // name ? $name.removeClass(validationClassName) : $name.addClass(validationClassName);
      // companyName ? $companyName.removeClass(validationClassName) : $companyName.addClass(validationClassName);
      // phoneNumber ? $phoneNumber.removeClass(validationClassName) : $phoneNumber.addClass(validationClassName);
      // providerName ? $providerName.removeClass(validationClassName) : $providerName.addClass(validationClassName);

      if (email && validator.isEmail(email)) {
        $email.removeClass(validationClassName)
      } else {
        isValid = false;
        $email.addClass(validationClassName);
      }

      if (password && validator.isLength(password, { min: 6 })) {
        $password.removeClass(validationClassName)
      } else {
        isValid = false;
        $password.addClass(validationClassName);
      }

      if (!isValid) {
        return false;
      }

      const result = await sendPostRequest(URL_REGISTER_USER, {
        name, email, password, companyName, phoneNumber, providerName,
      });

      if (!result) {
        return false;
      }

      location.href = '/';
    });
});
