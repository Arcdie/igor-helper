const URL_GET_SETTINGS = '/api/settings';

const $alerts = $('.alerts');

const validationClassName = 'is-invalid';

const regionCoordinatesMapper = new Map([
  ['АР Крим', { lat: 45.2644427137645, lng: 34.21174777355826 }],
  ['Вінницька', { lat: 49.23022504191039, lng: 28.469443279820183 }],
  ['Волинська', { lat: 51.22143430193369, lng: 24.867071894459222 }],
  ['Дніпропетровська', { lat: 48.457531588336785, lng: 35.04602308967974 }],
  ['Донецька', { lat: 47.993689153200805, lng: 37.80523617474994 }],
  ['Житомирська', { lat: 50.25106444604714, lng: 28.673431957033735 }],
  ['Закарпатська', { lat: 48.479473112331306, lng: 22.461066628583556 }],
  ['Запорізька', { lat: 47.83840690765006, lng: 35.17058234611588 }],
  ['Івано-Франківська', { lat: 48.91136654267092, lng: 24.71996918881603 }],
  ['Київська', { lat: 50.444860760964936, lng: 30.544450006424704 }],
  ['Кіровоградська', { lat: 47.898901193070714, lng: 33.40260880498798 }],
  ['Луганська', { lat: 48.566953409962174, lng: 39.316954647988794 }],
  ['Львівська', { lat: 49.833020835696075, lng: 24.02996009232962 }],
  ['Миколаївська', { lat: 46.96730547302697, lng: 32.01163117296329 }],
  ['Одеська', { lat: 46.47398118742897, lng: 30.73172394640079 }],
  ['Полтавська', { lat: 49.58144519285062, lng: 34.55788024276513 }],
  ['Рівненська', { lat: 50.61935389922496, lng: 26.255148893742312 }],
  ['Сумська', { lat: 50.89787098840855, lng: 34.80526745282628 }],
  ['Тернопільська', { lat: 49.54816267568043, lng: 25.607204893787067 }],
  ['Харківська', { lat: 49.97986729670975, lng: 36.246115306401514 }],
  ['Херсонська', { lat: 46.64146432175457, lng: 32.6097885599206 }],
  ['Хмельницька', { lat: 49.41200708511872, lng: 27.001520446149765 }],
  ['Черкаська', { lat: 49.422754867430214, lng: 32.06060243433254 }],
  ['Чернівецька', { lat: 48.279775480267475, lng: 25.958603480997006 }],
  ['Чернігівська', { lat: 51.48904160434725, lng: 31.294950845757427 }],
]);

const initTooltips = () => {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
};

const addAlert = (type, message) => {
  let className = 'success';

  switch (type) {
    case 'error': className = 'danger'; break;
    case 'warn': className = 'warning'; break;
    case 'warning': className = 'warning'; break;
  }

  const id = new Date().getTime();
  $alerts.prepend(`<div id="alert-${id}" class="alert alert-${className}" role="alert">
    <div class="alert-content col-10">${message}</div>
    <button class="btn-close col-2" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`);

  setTimeout(() => { $(`#alert-${id}`).remove(); }, 5000);
};

const getSettings = () => sendGetRequest(URL_GET_SETTINGS);

$(document).ready(() => {
  initTooltips();

  $('.modal button.btn-close')
    .on('click', function () {
      $(this).closest('.modal').find('.ih-input').val('');
    });

  if (typeof $.mask !== 'undefined') {
    $('input[type="tel"]').mask('+38(999) 999-99-99');
  }
});
