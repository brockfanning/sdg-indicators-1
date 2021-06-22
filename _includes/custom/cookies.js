var manager = klaro.getManager(),
    consents = manager.loadConsents(),
    $cookieBanner = $('#cookie-banner'),
    $confirmationAccept = $('#cookie-banner-accept'),
    $confirmationReject = $('#cookie-banner-reject'),
    $cookiePageSubmit = $('#cookie-page-submit');

if (!manager.confirmed) {
  $cookieBanner.show();
  $('#cookie-accept').click(function() {
    if (typeof consents['google-analytics'] !== 'undefined') {
      consents['google-analytics'] = true;
    }
    manager.saveAndApplyConsents();
    $cookieBanner.hide();
    $confirmationAccept.show();
  });
  $('#cookie-reject').click(function() {
    if (typeof consents['google-analytics'] !== 'undefined') {
      consents['google-analytics'] = false;
    }
    manager.saveAndApplyConsents();
    $cookieBanner.hide();
    $confirmationReject.show();
  });
  $('#hide-accept').click(function(e) {
    e.preventDefault();
    $confirmationAccept.hide();
  });
  $('#hide-reject').click(function(e) {
    e.preventDefault();
    $confirmationReject.hide();
  });
}

if ($cookiePageSubmit.length > 0) {
  var $analyticsYes = $('#analytics-cookies'),
      $cookiePageSuccess = $('#cookie-page-success'),
      $cookiePageGoBack = $('#cookie-page-go-back'),
      saveCookieSettings = function(e) {
        e.preventDefault();
        if (typeof consents['google-analytics'] !== 'undefined') {
          consents['google-analytics'] = Boolean($analyticsYes.prop('checked'));
        }
        manager.saveAndApplyConsents();
        $cookiePageSuccess.show();
        $([document.documentElement, document.body]).animate({
          scrollTop: $cookiePageSuccess.offset().top
        }, 500);
      };

  // Set pre-selected options.
  if (typeof consents['google-analytics'] !== 'undefined') {
    $analyticsYes.prop('checked', Boolean(consents['google-analytics']));
  }

  $cookiePageSubmit.click(saveCookieSettings);

  // For semantics and accessibility, wrap the page in a form and add
  // a submit handler.
  $('#main-content > div').first().wrap('<form id="cookie-page-form" novalidate></form>');
  $('#cookie-page-form').submit(saveCookieSettings);

  // Go back behavior.
  $cookiePageGoBack.click(function(e) {
    e.preventDefault();
    window.history.back();
  });
}
