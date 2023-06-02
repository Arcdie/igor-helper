const $alerts = $('.alerts');

const validationClassName = 'is-invalid';

const initTooltips = () => {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
};

const addAlert = (type, message) => {
  let className = 'success';

  switch (type) {
    case 'error': className = 'danger'; break;
    case 'warn': className = 'warning'; break;
  }

  const id = new Date().getTime();
  $alerts.prepend(`<div id="alert-${id}" class="alert alert-${className}" role="alert">
    <div class="alert-content col-10">${message}</div>
    <button class="btn-close col-2" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`);

  setTimeout(() => { $(`#alert-${id}`).remove(); }, 5000);
};

$(document).ready(() => {
  initTooltips();

  $('.modal button.btn-close')
    .on('click', function () {
      $(this).closest('.modal').find('.ih-input').val('');
    });
});
