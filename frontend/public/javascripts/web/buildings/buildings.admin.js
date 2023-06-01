/* global
functions, addAlert, sendGetRequest, sendPostRequest, sendPutRequest,
objects, moment,
vars, validationClassName,
*/

/* Constants */

const URL_GET_CLIENTS = '/api/users/clients';
const URL_GET_SETTINGS = '/api/settings';
const URL_GET_BUILDINGS = '/api/buildings';
const URL_GET_BUILDING = '/api/buildings/:buildingId';
const URL_UPDATE_BUILDING = '/api/buildings/:buildingId';
const URL_ARCHIVE_BUILDING = '/api/buildings/:buildingId/archive';
const URL_GET_REPORT_BY_BUILDING = '/api/buildings/:buildingId/report';
const URL_GET_REPORT_FILES = '/api/reports/:reportId/files';

/* Variables */
const searchSettings = {
  status: '',
  sortType: 'desc',
};

let settings;
let targetBuildingId;

/* JQuery */
const $listBuilding = $('.ih-list-building');

const $modalGoogleMap = $('.modal#googleMap');
const $modalUpdateReport = $('.modal#updateReport');
const $modalUpdateBuilding = $('.modal#updateBuilding');

const modalGoogleMap = new bootstrap.Modal($modalGoogleMap[0], {});
const modalUpdateReport = new bootstrap.Modal($modalUpdateReport[0], {});
const modalUpdateBuilding = new bootstrap.Modal($modalUpdateBuilding[0], {});

$(document).ready(async () => {
  disableLink();

  const users = await getUsers();
  console.log('users', users);


  await loadBuildings();
  settings = await getSettings();

  if (!settings) {
    return false;
  }

  $('#buildingStatusSelect')
    .on('change', async function () {
      searchSettings.status = this.value;
      await loadBuildings();
    });

  $('#buildingCreatedAtSelect')
    .on('change', async function () {
      searchSettings.sortType = this.value;
      await loadBuildings();
    });

  $('.ih-list-building')
    // archive
    .on('click', '.ih-building .btn-close', async function () {
      if (!confirm("Ви підтверджуєте видалення об'єкту?")) {
        return false;
      }

      const $container = $(this).closest('.ih-building-container');
      targetBuildingId = $container.data('buildingid');

      const result = await archiveBuilding(targetBuildingId);

      if (result) {
        $container.remove();
        addAlert('success', `Об'єк успішно видалено`);
      }
    })
    // update
    .on('click', '.ih-building .init-modal-update-building', async function () {
      const $container = $(this).closest('.ih-building-container');
      targetBuildingId = $container.data('buildingid');

      const building = await getBuilding(targetBuildingId);

      if (!building) {
        return false;
      }

      const $x = $('#updateBuildingX');
      const $y = $('#updateBuildingY');
      const $name = $('#updateBuildingName');
      const $comment = $('#updateBuildingComment');
      const $regionName = $('#updateBuildingRegionName');
      const $listEquipment = $('#updateBuildingListEquipment');

      $x.val(building.lat);
      $y.val(building.lng);
      $name.val(building.name);
      $regionName.val(building.regionName);
      $listEquipment.val(building.listEquipment);
      building.comment && $comment.val(building.comment);

      modalUpdateBuilding.show();
    })
    // updateReport
    .on('click', '.ih-building .init-modal-update-report', async function () {
      const $container = $(this).closest('.ih-building-container');
      targetBuildingId = $container.data('buildingid');

      const report = await getReportByBuildingId(targetBuildingId);

      if (!report) {
        return false;
      }

      const reportFiles = await getReportFiles(report._id);

      const $comment = $('#updateReportComment');
      const $listEquipment = $('#updateReportListEquipment');
      const $listSerialNumber = $('#updateReportListSerialNumber');

      $listEquipment.val(report.listEquipment);
      $listSerialNumber.val(report.listSerialNumber);
      report.comment && $comment.val(report.comment);

      if (reportFiles.length) {
        const $updateReportFiles = $('#updateReportFiles');
        const $file = $updateReportFiles.find('.ih-file').first();
        $updateReportFiles.empty();

        reportFiles.forEach(file => {
          const $cloneFile = $file.clone();

          $cloneFile.addClass('ih-file-uploaded');
          $cloneFile.find('a').attr('href', `/files/${file.name}.${file.extentionType}`);
          $cloneFile.find('input[type="text"]').val(file.originalName);
          $cloneFile.find('input[type="file"]').attr('id', `file-${file._id}`);

          $updateReportFiles.prepend($cloneFile);
        });

        $file.remove();
      }

      modalUpdateReport.show();
    });

  // modal#updateBuilding
  $('#updateBuilding')
    .on('click', 'button#updateBuildingGetMap', function () {
      const myLatlng = { lat: 49.5122845, lng: 31.1236211 };

      const map = new google.maps.Map(document.getElementById('map'), {
        center: myLatlng,
        zoom: 7
      });

      // Create the initial InfoWindow.
      let infoWindow = new google.maps.InfoWindow({
        content: 'Натисніть для вибору точки',
        position: myLatlng,
      });

      infoWindow.open(map);

      window.setXAndY = (x, y) => {
        $('#updateBuildingX').val(x);
        $('#updateBuildingY').val(y);

        modalGoogleMap.hide();
        modalUpdateBuilding.show();
        delete window.setXAndY;
      };

      map.addListener('click', mapsMouseEvent => {
        infoWindow.close();

        infoWindow = new google.maps.InfoWindow({
          position: mapsMouseEvent.latLng,
        });

        const coordinates = mapsMouseEvent.latLng.toJSON();

        infoWindow.setContent(`<button
          style="background-color: white; border: none;"
          onclick="setXAndY(${coordinates.lat}, ${coordinates.lng})"
        >Підтвердити</button>`);

        infoWindow.open(map);
      });

      modalUpdateBuilding.hide();
      modalGoogleMap.show();
    })
    .on('click', '#updateBuildingButton', async () => {
      const $x = $('#updateBuildingX');
      const $y = $('#updateBuildingY');
      const $name = $('#updateBuildingName');
      const $regionName = $('#updateBuildingRegionName');
      const $listEquipment = $('#updateBuildingListEquipment');

      let isValid = true;

      [$x, $y, $name, $regionName, $listEquipment].forEach($e => {
        const value = $e.val();

        if (!value) {
          isValid = false;
          $e.addClass(validationClassName);
        } else {
          $e.removeClass(validationClassName)
        }
      });

      // todo: check is valid regionName

      if (!isValid) {
        return false;
      }

      const lat = $x.val();
      const lng = $y.val();
      const name = $name.val();
      const regionName = $regionName.val();
      const listEquipment = $listEquipment.val();

      const result = await updateBuilding(targetBuildingId, {
        lat, lng, name, comment, regionName, listEquipment
      });

      if (result) {
        addAlert('success', `Об'єкт успішно змінено`);
        $modalUpdateBuilding.find('button.btn-close').click();

        await loadBuildings();
      }
    });

  // modal#updateReport
  $('#updateReportButton')
    .on('click', async () => {
      const report = await getReportByBuildingId(targetBuildingId);

      if (!report) {
        return false;
      }

      const resultUpdate = await updateReport(report._id, {
        // status: 
      });

      if (!resultUpdate) {
        return false;
      }

      addAlert('success', `Звіт успішно змінено`);
      $modalUpdateReport.find('button.btn-close').click();

      await loadBuildings();
    });
});

const loadBuildings = async () => {
  $listBuilding.empty();

  const buildings = await getBuildings(searchSettings);
  buildings && buildings.length && renderBuildings(buildings);
};

const renderBuildings = (buildings) => {
  let appendStr = '';

  buildings.forEach(building => {
    let status = building.isReserved ? 'Зарезервовано' : 'Створено';

    if (building.report) {
      switch (building.report.status) {
        case 0: status = 'Обробка звіту'; break;
        case 1: status = 'Затверджено'; break;
        case 2: status = 'Відхилено'; break;
      }
    }

    const validDate = moment(building.createdAt).format('DD.MM.YY HH:mm');

    let buttonsSection = '';

    if (!['Зарезервовано', 'Створено'].includes(status)) {
      buttonsSection += `<button class="btn btn-secondary init-modal-update-report">Звіт</button>`;
    }

    appendStr += `<div class="ih-building-container col-4" data-buildingid="${building._id}">
      <div class="ih-building">
        <div class="ih-status">
          <span class="col-5">${validDate}</span>
          <span class="col-5 text-end">${status}</span>
          ${(['Зарезервовано', 'Створено'].includes(status)) ? '<button class="btn-close col-2" aria-label="Close"></button>' : ''}
        </div>

        <div class="ih-building-body">
          <span>${building.name} (${building.regionName} обл.)</span>
          <span>${building.comment || ''}</span>
        </div>

        <div class="ih-buttons">
          <button class="btn btn-secondary init-modal-update-building">Редагувати об'єкт</button>
          ${buttonsSection}
        </div>
      </div>
    </div>`;
  });

  $listBuilding.empty().append(appendStr);
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

const getClients = () => sendGetRequest(URL_GET_CLIENTS);

const getSettings = () => sendGetRequest(URL_GET_SETTINGS);

const getReports = () => sendGetRequest(URL_GET_BUILDINGS, searchSettings);
const getBuildings = (searchSettings) => sendGetRequest(URL_GET_BUILDINGS, searchSettings);

const getBuilding = (buildingId) => {
  const url = URL_GET_BUILDING.replace(':buildingId', buildingId);
  return sendGetRequest(url);
};

const updateBuilding = (buildingId, body) => {
  const url = URL_UPDATE_BUILDING.replace(':buildingId', buildingId);
  return sendPutRequest(url, body);
};

const archiveBuilding = (buildingId) => {
  const url = URL_ARCHIVE_BUILDING.replace(':buildingId', buildingId);
  return sendPostRequest(url);
};

const getReportByBuildingId = (buildingId) => {
  const url = URL_GET_REPORT_BY_BUILDING.replace(':buildingId', buildingId);
  return sendGetRequest(url);
};

const getReportFiles = (reportId) => {
  const url = URL_GET_REPORT_FILES.replace(':reportId', reportId);
  return sendGetRequest(url);
};
