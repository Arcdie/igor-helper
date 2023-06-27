/* global
functions, addAlert, getSettings, buttonDisabler, sendGetRequest, sendPostRequest, sendPutRequest,
objects, moment,
vars, validationClassName, regionCoordinatesMapper
*/

/* Constants */

const URL_GET_USERS = '/api/users';
const URL_GET_USER = '/api/users/:userId';
const URL_UPDATE_USER = '/api/users/:userId';

/* Variables */
const searchSettings = {
  email: '',
};

let settings;

/* JQuery */
const $userList = $('.ih-user-list-admin table tbody');

const $modalUpdateUser = $('.modal#updateUser');

const modalUpdateUser = new bootstrap.Modal($modalUpdateUser[0], {});

$(document).ready(async () => {
  disableLink();

  settings = await getSettings();
  loadUserDatalist(await loadUsers());

  if (!settings) {
    return false;
  }

  $('#userUsers')
    .on('input', async function () {
      searchSettings.email = this.value;
      await loadUsers();
    });

  $('.ih-user-list-admin')
    // update user
    .on('click', 'button.init-modal-update-user', async function () {
      const $container = $(this).closest('tr');
      const userId = $container.data('userid');

      const user = await getUser(userId);

      if (!user) {
        return false;
      }

      targetUserId = userId;

      const $name = $('#updateUserName');
      const $role = $('#updateUserRole');
      const $email = $('#updateUserEmail');
      const $password = $('#updateUserPassword');
      const $companyName = $('#updateUserCompanyName');
      const $phoneNumber = $('#updateUserPhoneNumber');
      const $providerName = $('#updateUserProviderName');

      $role
        .find('option')
        .attr('selected', false);

      $role
        .find(`option[value="${user.role}"`)
        .attr('selected', true);

      $name.val(user.name);
      $email.val(user.email);
      $password.val(user.password);
      $companyName.val(user.companyName);
      $phoneNumber.val(user.phoneNumber);
      $providerName.val(user.providerName);

      modalUpdateUser.show();
    })

  // modal#updateUser
  $('#updateUserButton')
    .on('click', async function () {
      const enable = buttonDisabler($(this));

      const $role = $('#updateUserRole');
      const $name = $('#updateUserName');
      const $email = $('#updateUserEmail');
      const $password = $('#updateUserPassword');
      const $companyName = $('#updateUserCompanyName');
      const $phoneNumber = $('#updateUserPhoneNumber');
      const $providerName = $('#updateUserProviderName');

      let isValid = true;

      [$name, $email, $password, $companyName, $phoneNumber, $providerName].forEach($e => {
        const value = $e.val();

        if (!value) {
          isValid = false;
          $e.addClass(validationClassName);
        } else {
          $e.removeClass(validationClassName)
        }
      });

      if (!isValid) {
        enable();
        return false;
      }

      const name = $name.val();
      const email = $email.val();
      const password = $password.val();
      const companyName = $companyName.val();
      const phoneNumber = $phoneNumber.val();
      const providerName = $providerName.val();
      const role = parseInt($role.val(), 10);

      const result = await updateUser(targetUserId, {
        name, email, password, companyName, phoneNumber, providerName, role,
      });

      enable();

      if (result) {
        addAlert('success', 'Профіль користувача успішно змінено');
        $modalUpdateUser.find('button.btn-close').click();

        await loadUsers();
      }
    });
});

const loadUsers = async () => {
  const validSearchSettings = {};

  Object.keys(searchSettings).forEach(key => {
    if (searchSettings[key] !== '') {
      validSearchSettings[key] = searchSettings[key];
    }
  });

  const users = await getUsers(validSearchSettings);  
  renderUsers(users);

  return users;
};

const loadUserDatalist = (users) => {
  const appendStr = users.reduce((a, v) => a += `<option value="${v.email}">${v.name}</option>`, '');
  $('#userUsersDatalist').html(appendStr);
}

const renderUsers = (users) => {
  let appendStr = '';

  users.forEach((user, index) => {
    appendStr += `<tr data-userid="${user._id}">
      <td>${index + 1}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.phoneNumber}</td>
      <td>${user.companyName}</td>
      <td>${user.providerName}</td>
      <td><button class="btn btn-secondary init-modal-update-user">Редагувати</button></td>
    </tr>`;
  });

  $userList.html(appendStr);
};

const disableLink = () => {
  const { pathname } = location;

  $('header .nav-link').each((i, e) => {
    const $e = $(e);

    if ($e.attr('href') === pathname) {
      $e.addClass('disabled');
    }
  });
};

const getUsers = (searchSettings) => sendGetRequest(URL_GET_USERS, searchSettings);

const getUser = (userId) => {
  const url = URL_GET_USER.replace(':userId', userId);
  return sendGetRequest(url);
};

const updateUser = (userId, body) => {
  const url = URL_UPDATE_USER.replace(':userId', userId);
  return sendPutRequest(url, body);
};
