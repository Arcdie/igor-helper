/* global
functions,
objects,
vars,
*/

/* Constants */

/* JQuery */

$(document).ready(async () => {
  disableLink();
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
