/* global
functions, addAlert, sendGetRequest, sendPostRequest, sendPutRequest,
objects, moment,
vars, validationClassName, regionCoordinatesMapper
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
const URL_UPDATE_REPORT_STATUS = '/api/reports/:reportId/status';

/* Variables */
const searchSettings = {
  status: '',
  isReport: '',
  regionName: '',
  clientEmail: '',
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

  await loadBuildings();
  await loadClientDatalist();
  settings = await getSettings();

  if (!settings) {
    return false;
  }

  loadRegionDatalist('#buildingRegionNameDatalist');
  loadRegionDatalist('#updateBuildingRegionNameDatalist');

  $('#buildingClient')
    .on('input', async function () {
      const value = this.value;

      const isMatch = $('#buildingClientDatalist option').some(function () {
        return this.value === value;
      });

      if (isMatch || val === '') {
        searchSettings.clientEmail = this.value;
        await loadBuildings();
      }
    });

  $('#buildingRegionName')
    .on('input', async function () {
      const value = this.value;
      const isMatch = settings.regions.some(r => r === value);

      if (isMatch || value === '') {
        searchSettings.regionName = this.value;
        await loadBuildings();
      }
    });

  $('#buildingStatusSelect')
    .on('change', async function () {
      searchSettings.status = this.value ? parseInt(this.value, 10) : '';
      await loadBuildings();
    });

  $('#buildingReportExistsSelect')
    .on('change', async function () {
      searchSettings.isReport = this.value;
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
      const $isReserved = $('#updateBuildingIsReserved');
      const $regionName = $('#updateBuildingRegionName');
      const $listEquipment = $('#updateBuildingListEquipment');

      $isReserved
        .find('option')
        .attr('selected', false);
      
      $isReserved
        .find(`option[value="${building.isReserved ? 'true' : 'false'}"]`)
        .attr('selected', true);

      $x.val(building.lat);
      $y.val(building.lng);
      $name.val(building.name);
      $regionName.val(building.regionName);
      $listEquipment.val(building.listEquipment);
      $comment.val(building.comment || '');

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

      const $status = $('#updateReportStatus');
      const $comment = $('#updateReportComment');
      const $listEquipment = $('#updateReportListEquipment');
      const $listSerialNumber = $('#updateReportListSerialNumber');

      $status
        .find('option')
        .attr('selected', false);

      $status
        .find(`option[value="${report.status}"`)
        .attr('selected', true);

      $comment.val(report.comment || '');
      $listEquipment.val(report.listEquipment);
      $listSerialNumber.val(report.listSerialNumber);

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
      const $x = $('#updateBuildingX');
      const $y = $('#updateBuildingY');
      const $regionName = $('#createBuildingRegionName');

      const lat = parseFloat($x.val());
      const lng = parseFloat($y.val());
      const regionName = $regionName.val();

      const regionCoordinates = regionCoordinatesMapper.get(regionName);

      const defaultCoordinates = regionCoordinates ?
        regionCoordinates : regionCoordinatesMapper.get('Київська');

      const myLatlng = (lat & lng) ? { lat, lng } : defaultCoordinates;

      const map = new google.maps.Map(document.getElementById('map'), {
        center: myLatlng,
        zoom: regionCoordinates ? 9 : 7,
      });

      // Create the initial InfoWindow.
      let infoWindow = new google.maps.InfoWindow({
        content: 'Натисніть для вибору точки',
        position: myLatlng,
      });

      infoWindow.open(map);

      window.setXAndY = (x, y) => {
        $x.val(x);
        $y.val(y);

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
          style="background-color: #0086ff7d; border: none; padding: 3px;"
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
      const $isReserved = $('#updateBuildingIsReserved');
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
      const isReserved = $isReserved.val() === 'true';

      const result = await updateBuilding(targetBuildingId, {
        lat, lng, name, regionName, listEquipment, isReserved,
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

      const $status = $('#updateReportStatus');

      const status = parseInt($status.val(), 10);

      if (status !== report.status) {
        const resultUpdate = await updateReportStatus(report._id, status);

        if (!resultUpdate) {
          return false;
        }
      }

      addAlert('success', `Звіт успішно змінено`);
      $modalUpdateReport.find('button.btn-close').click();

      await loadBuildings();
    });
});

const loadClientDatalist = async () => {
  const clients = await getClients();
  const appendStr = clients.reduce((a, v) => a += `<option value="${v.email}">${v.name}</option>`, '');
  $('#buildingClientDatalist').html(appendStr);
};

const loadRegionDatalist = (containerId) => {
  const appendStr = settings.regions.reduce((a, v) => a += `<option>${v}</option>`, '');
  $(containerId).html(appendStr);
};

const loadBuildings = async () => {
  $listBuilding.empty();

  const validSearchSettings = {};

  Object.keys(searchSettings).forEach(key => {
    if (searchSettings[key] !== '') {
      validSearchSettings[key] = searchSettings[key];
    }
  });

  if (validSearchSettings.isReport) {
    validSearchSettings.isReport = validSearchSettings.isReport === 'true';
  }

  if (validSearchSettings.status) {
    validSearchSettings.status = parseInt(validSearchSettings.status, 10);
  }

  const buildings = await getBuildings(validSearchSettings);
  buildings && buildings.length && renderBuildings(buildings);
};

const renderBuildings = (buildings) => {
  let appendStr = '';

  buildings.forEach(building => {
    let enStatus = building.isReserved ? 'Reserved' : 'Created';
    let status = building.isReserved ? 'Зарезервовано' : 'Створено';

    if (building.report) {
      switch (building.report.status) {
        case 0:
          status = 'Обробка звіту';
          enStatus = 'InProcess'
          break;
        case 1:
          status = 'Затверджено';
          enStatus = 'Approved';
          break;
        case 2:
          status = 'Відхилено';
          enStatus = 'Rejected';
          break;
      }
    }

    const validDate = moment(building.createdAt).format('DD.MM.YY HH:mm');

    let buttonsSection = '';

    if (!['Зарезервовано', 'Створено'].includes(status)) {
      buttonsSection += `<button class="btn btn-secondary init-modal-update-report">Звіт</button>`;
    }

    appendStr += `<div class="ih-building-container col-4" data-buildingid="${building._id}">
      <div class="ih-building ih-${enStatus}">
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

const updateReportStatus = (reportId, status) => {
  const url = URL_UPDATE_REPORT_STATUS.replace(':reportId', reportId);
  return sendPutRequest(url, { status });
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
