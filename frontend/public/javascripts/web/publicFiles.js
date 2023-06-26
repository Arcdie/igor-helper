/* global
functions,
objects,
vars,
*/

/* Constants */
const fileList = {
  auxhp: [
    '20230210_R32_Technical_&_Service_manual_Air_to_water_heat_pump_split.docx',
    'Instalation manual AUX HP.pdf',
    'Instalation manual IDU AUX HP.pdf',
    'Remote controller AUX HP.pdf',
    'Technical data AUX HP.pdf',
  ],

  thermav: [
    'Інструкуція_з_монтажу_Hydrosplit_R_32_Ukrainian.pdf',
    'Інструкція користувача.pdf',
    'Каталог LG_Therma V 2021.pdf',
    'ТhermaV Installation manual UKR.pdf',
    'ТhermaV Service and installation manual UKR.pdf',
    'KR_ThermaV_Hydrosplit(R32_50Hz)_HP_EU_Gen1.pdf',
    'KR_ThermaV_SplitR32_50Hz_ 9 kW.pdf',
    'KR_ThermaV_SplitR410A_50Hz_ IDU.pdf',
    'KR_ThermaV_SplitR410A_50Hz_ ODU.pdf',
    'LG_Therma-V_Leaflet_2022.pdf',
    'Therma V owner ukraine.pdf',
    'ThermaV_Comprehensive_application_and_installation_manual_ENG.pdf',
  ],
};

/* JQuery */
const $fileList = $('.ih-files');

$(document).ready(async () => {
  disableLink();
  fillFileList();
});

const disableLink = () => {
  const { pathname } = location;

  $('header .nav-link').each((i, e) => {
    const $e = $(e);

    if ($e.attr('href') === pathname) {
      $e.addClass('disabled');
    }
  });
};

const fillFileList = () => {
  // const siteName = 'thermav';
  const siteName = location.host.split('.')[0];
  const files = fileList[siteName] || [];

  let appendStr = '';

  files.forEach(file => {
    appendStr += `<div class="ih-file-container col-12 col-xl-4">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${file}</h5>
          <p class="card-text"></p>
          <a class="btn btn-secondary float-end" href="/files/${file}" download="${file}">Завантажити</a>
        </div>
      </div>
    </div>`;
  });

  $fileList.html(appendStr);
};
