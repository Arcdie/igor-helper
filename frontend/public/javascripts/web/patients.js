/* global
functions, makeRequest,
objects,
*/

/* Constants */

const URL_GET_PATIENTS = '/api/patients';
const URL_CHECK_PATIENTS = '/api/patients/check';

/* Variables *

/* JQuery */
const $reload = $('.reload');
const $numberPatients = $('#number-patients');

const $shadow = $('.shadow');
const $popup = $shadow.find('.popup');

wsClient.onmessage = async data => {
  const parsedData = JSON.parse(data.data);
  console.log('parsedData', parsedData);

  if (parsedData.event !== 'checkPatients') {
    return false;
  }

  if (parsedData.message.isFinished) {
    $shadow.removeClass('is_active');

    if (parsedData.message.error) {
      alert(parsedData.message.error);
    }
  } else {
    $popup.empty().append(`<p>Оброблено ${parsedData.message.current} з ${parsedData.message.totalCount}</p>`);
  }
};

$(document).ready(async () => {
  const patients = await getPatients();
  $numberPatients.text(patients.length);

  $reload
    .on('click', async () => {
      $shadow.addClass('is_active');
      const result = await checkPatients();

      if (!result.status) {
        alert(result.message);
      }
    });
});

const getPatients = async (name) => {
  const response = await makeRequest({
    method: 'GET',
    url: URL_GET_PATIENTS,
  });

  if (!response) {
    alert('Can not get patients');
    return false;
  }

  return response;
};

const checkPatients = async () => {
  const response = await makeRequest({
    method: 'GET',
    url: URL_CHECK_PATIENTS,
  });

  if (!response) {
    alert('Can not check patients');
    return false;
  }

  return response;
};
