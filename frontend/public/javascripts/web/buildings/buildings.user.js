/* global
functions, addAlert, getSettings, sendGetRequest, sendPostRequest, sendPutRequest,
objects, moment,
vars, validationClassName, regionCoordinatesMapper
*/

/* Constants */

const URL_GET_BUILDINGS = '/api/buildings';
const URL_GET_BUILDING = '/api/buildings/:buildingId';
const URL_CREATE_BUILDING = '/api/buildings';
const URL_UPDATE_BUILDING = '/api/buildings/:buildingId';
const URL_ARCHIVE_BUILDING = '/api/buildings/:buildingId/archive';
const URL_UPDATE_REPORT = '/api/reports/:reportId';
const URL_CREATE_REPORT = '/api/buildings/:buildingId/report'
const URL_GET_REPORT_BY_BUILDING = '/api/buildings/:buildingId/report';
const URL_GET_REPORT_FILES = '/api/reports/:reportId/files';
const URL_UPDATE_FILES_IN_REPORT = '/api/reports/:reportId/files';

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
const $modalCreateReport = $('.modal#createReport');
const $modalUpdateReport = $('.modal#updateReport');
const $modalCreateBuilding = $('.modal#createBuilding');
const $modalUpdateBuilding = $('.modal#updateBuilding');

const modalGoogleMap = new bootstrap.Modal($modalGoogleMap[0], {});
const modalCreateReport = new bootstrap.Modal($modalCreateReport[0], {});
const modalUpdateReport = new bootstrap.Modal($modalUpdateReport[0], {});
const modalCreateBuilding = new bootstrap.Modal($modalCreateBuilding[0], {});
const modalUpdateBuilding = new bootstrap.Modal($modalUpdateBuilding[0], {});

$(document).ready(async () => {
  disableLink();

  await loadBuildings();
  settings = await getSettings();

  if (!settings) {
    return false;
  }

  loadRegionDatalist('#createBuildingRegionNameDatalist');

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

      const $name = $('#updateBuildingName');
      const $comment = $('#updateBuildingComment');
      const $listEquipment = $('#updateBuildingListEquipment');

      $name.val(building.name || '');
      $comment.val(building.comment || '');
      $listEquipment.val(building.listEquipment || '');

      modalUpdateBuilding.show();
    })
    // createReport
    .on('click', '.ih-building .init-modal-create-report', async function () {
      const $container = $(this).closest('.ih-building-container');
      targetBuildingId = $container.data('buildingid');

      modalCreateReport.show();
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

      $comment.val(report.comment || '');
      $listEquipment.val(report.listEquipment || '');
      $listSerialNumber.val(report.listSerialNumber || '');

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

  // modal#createBuilding
  $('#createBuilding')
    .on('click', 'button#createBuildingGetMap', function () {
      const $x = $('#createBuildingX');
      const $y = $('#createBuildingY');
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
        modalCreateBuilding.show();
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

      modalCreateBuilding.hide();
      modalGoogleMap.show();
    })
    .on('click', '#createBuildingButton', async () => {
      const $x = $('#createBuildingX');
      const $y = $('#createBuildingY');
      const $name = $('#createBuildingName');
      const $comment = $('#createBuildingComment');
      const $regionName = $('#createBuildingRegionName');
      const $listEquipment = $('#createBuildingListEquipment');

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

      if (!isValid) {
        return false;
      }

      const lat = $x.val();
      const lng = $y.val();
      const name = $name.val();
      const comment = $comment.val();
      const regionName = $regionName.val();
      const listEquipment = $listEquipment.val();

      const result = await createBuilding({
        lat, lng, name, comment, regionName, listEquipment,
      });

      if (result) {
        if (result.isReserved) {
          addAlert('success', `Об'єкт успішно додано`);
        } else {
          addAlert('warning', `Об'єкт пересікається з вже існуючим. Зверніться до менеджера`);
        }

        $modalCreateBuilding.find('button.btn-close').click();
        await loadBuildings();
      }
    });

  // modal#updateBuilding
  $('#updateBuildingButton')
    .on('click', async () => {
      const $name = $('#updateBuildingName');
      const $comment = $('#updateBuildingComment');
      const $listEquipment = $('#updateBuildingListEquipment');

      let isValid = true;

      [$name, $listEquipment].forEach($e => {
        const value = $e.val();

        if (!value) {
          isValid = false;
          $e.addClass(validationClassName);
        } else {
          $e.removeClass(validationClassName)
        }
      });

      if (!isValid) {
        return false;
      }

      const name = $name.val();
      const comment = $comment.val();
      const listEquipment = $listEquipment.val();

      const result = await updateBuilding(targetBuildingId, { name, comment, listEquipment });

      if (result) {
        addAlert('success', `Об'єкт успішно змінено`);
        $modalUpdateBuilding.find('button.btn-close').click();

        await loadBuildings();
      }
    });

  // modal#createReport
  $('#createReport')
    .on('click', '.ih-add-file button', function () {
      const $createReportFile = $('#createReportFiles');
      const $file = $createReportFile.find('.ih-file').first();

      const $clone = $file.clone();
      $clone.find('input').val('');
      $createReportFile.append($clone);
    })
    .on('change', '.ih-file input[type="file"]', function () {
      const fileName = this.files[0].name;
      const $file = $(this).closest('.ih-file');
      $file.find('input[type="text"]').val(fileName);
    })
    .on('click', '.ih-file button.btn-close', function () {
      const $file = $(this).closest('.ih-file');
      const $files = $('#createReportFiles .ih-file');
      $files.length === 1 ? $file.find('input').val(null) : $file.remove();
    });

  // modal#updateReport
  $('#updateReport')
    .on('click', '.ih-add-file button', function () {
      const $updateReportFiles = $('#updateReportFiles');
      const $file = $updateReportFiles.find('.ih-file').first();

      const $clone = $file.clone();
      $clone.find('input').val('');
      $clone.removeClass('ih-file-uploaded');
      $updateReportFiles.append($clone);
    })
    .on('change', '.ih-file input[type="file"]', function () {
      const fileName = this.files[0].name;
      const $file = $(this).closest('.ih-file');
      $file.addClass('ih-file-new');
      $file.find('input[type="text"]').val(fileName);
    })
    .on('click', '.ih-file button.btn-close', function () {
      const $file = $(this).closest('.ih-file');
      const $files = $('#updateReportFiles .ih-file');

      if ($files.length === 1) {
        $file.removeClass('ih-file-uploaded');
        $file.find('input').val(null).attr('id', null);
      } else {
        $file.remove();
      }
    });

  $('#createReportButton')
    .on('click', async () => {
      const $comment = $('#createReportComment');
      const $listEquipment = $('#createReportListEquipment');
      const $listSerialNumber = $('#createReportListSerialNumber');
      const $files = $('#createReportFiles .ih-file input[type="file"]');

      let isValid = true;

      [$listEquipment, $listSerialNumber].forEach($e => {
        const value = $e.val();

        if (!value) {
          isValid = false;
          $e.addClass(validationClassName);
        } else {
          $e.removeClass(validationClassName)
        }
      });

      if (!isValid) {
        return false;
      }

      const files = [];
      const filesInfo = [];
      const comment = $comment.val();
      const listEquipment = $listEquipment.val();
      const listSerialNumber = $listSerialNumber.val();

      $files.each((i, e) => {
        const file = e.files[0];
        const fileId = $(e).attr('id');

        if (file) {
          files.push(file);
          filesInfo.push({ fileId: file.name, isNew: true });
        } else if (fileId) {
          filesInfo.push({ fileId: fileId.split('file-')[1], isNew: false });
        }
      });

      const resultSave = await createReport(targetBuildingId, {
        comment,
        listEquipment,
        listSerialNumber,
      });

      if (!resultSave) {
        return false;
      }

      if (files.length) {
        const data = new FormData();

        if (filesInfo.length) {
          data.append('filesInfo', JSON.stringify(filesInfo));
        }

        if (files.length) {
          files.forEach(f => data.append('files', f));
        }

        const resultUpload = await updateFilesInReport(resultSave._id, data);

        if (!resultUpload) {
          addAlert('warn', 'Не вдалося завантажити файли');
        }
      }

      addAlert('success', `Звіт успішно створено`);
      $modalCreateReport.find('button.btn-close').click();

      await loadBuildings();
    });

  // modal#updateReport
  $('#updateReportButton')
    .on('click', async () => {
      const $comment = $('#updateReportComment');
      const $listEquipment = $('#updateReportListEquipment');
      const $listSerialNumber = $('#updateReportListSerialNumber');
      const $files = $('#updateReportFiles .ih-file input[type="file"]');

      let isValid = true;

      [$listEquipment, $listSerialNumber].forEach($e => {
        const value = $e.val();

        if (!value) {
          isValid = false;
          $e.addClass(validationClassName);
        } else {
          $e.removeClass(validationClassName)
        } 
      });

      if (!isValid) {
        return false;
      }

      const report = await getReportByBuildingId(targetBuildingId);

      if (!report) {
        return false;
      }

      const files = [];
      const filesInfo = [];
      const comment = $comment.val();
      const listEquipment = $listEquipment.val();
      const listSerialNumber = $listSerialNumber.val();

      $files.each((i, e) => {
        const file = e.files[0];
        const fileId = $(e).attr('id');

        if (file) {
          files.push(file);
          filesInfo.push({ fileId: file.name, isNew: true });
        } else if (fileId) {
          filesInfo.push({ fileId: fileId.split('file-')[1], isNew: false });
        }
      });

      const resultUpdate = await updateReport(report._id, {
        comment,
        listEquipment,
        listSerialNumber,
      });

      if (!resultUpdate) {
        return false;
      }

      const data = new FormData();

      if (filesInfo.length) {
        data.append('filesInfo', JSON.stringify(filesInfo));
      }

      if (files.length) {
        files.forEach(f => data.append('files', f));
      }

      const resultUpload = await updateFilesInReport(report._id, data);

      if (!resultUpload) {
        addAlert('warn', 'Не вдалося оновити файли');
      }

      addAlert('success', `Звіт успішно змінено`);
      $modalUpdateReport.find('button.btn-close').click();

      await loadBuildings();
    });
});

const loadRegionDatalist = (containerId) => {
  const appendStr = settings.regions.reduce((a, v) => a += `<option>${v}</option>`, '');
  $(containerId).html(appendStr);
};

const loadBuildings = async () => {
  $listBuilding.empty();

  const buildings = await getBuildings(searchSettings);
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

    if (['Зарезервовано', 'Створено'].includes(status)) {
      buttonsSection += `<button class="btn btn-secondary init-modal-update-building">Редагувати об'єкт</button>`;
    }

    if (status === 'Зарезервовано' && !building.report) {
      buttonsSection += '<button class="btn btn-secondary init-modal-create-report">Створити звіт</button>';
    }

    if (status === 'Обробка звіту') {
      buttonsSection += '<button class="btn btn-secondary init-modal-update-report">Редагувати звіт</button>';
    }

    appendStr += `<div class="ih-building-container col-4" data-buildingid="${building._id}">
      <div class="ih-building ih-${enStatus}">
        <div class="ih-status">
          <span class="col-5">${validDate}</span>
          <span class="col-5 text-end">${status}</span>
          ${ (['Зарезервовано', 'Створено'].includes(status)) ? '<button class="btn-close col-2" aria-label="Close"></button>' : '' }
        </div>

        <div class="ih-building-body">
          <span>${building.name} (${building.regionName} обл.)</span>
          <span>${building.comment || ''}</span>
        </div>

        <div class="ih-buttons">${buttonsSection}</div>
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

const createBuilding = (body) => sendPostRequest(URL_CREATE_BUILDING, body);
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

const createReport = (buildingId, body) => {
  const url = URL_CREATE_REPORT.replace(':buildingId', buildingId);
  return sendPostRequest(url, body);
};

const updateReport = (reportId, body) => {
  const url = URL_UPDATE_REPORT.replace(':reportId', reportId);
  return sendPutRequest(url, body);
};

const getReportByBuildingId = (buildingId) => {
  const url = URL_GET_REPORT_BY_BUILDING.replace(':buildingId', buildingId);
  return sendGetRequest(url);
};

const getReportFiles = (reportId) => {
  const url = URL_GET_REPORT_FILES.replace(':reportId', reportId);
  return sendGetRequest(url);
};

const updateFilesInReport = async (reportId, files) => {
  const url = URL_UPDATE_FILES_IN_REPORT.replace(':reportId', reportId);

  const response = await fetch(url, {
    method: 'PUT',
    body: files,
  });

  const result = await response.json();

  if (!result) {
    addAlert('error', `Не можу виконати запит ${url}`);
    return false;
  }

  if (!result.status) {
    addAlert('error', result.message || `Не можу виконати запит ${url}`);
    return false;
  }

  return result.status;
};
