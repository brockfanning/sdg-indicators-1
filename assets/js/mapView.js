var mapView = function () {

  "use strict";

  this.initialise = function(geoData, geoCodeRegEx) {
    $('.map').show();
    $('#map').sdgMap({
      geoData: geoData,
      geoCodeRegEx: geoCodeRegEx,
      serviceUrl: '/sdg-indicators-1/assets/js/gz_2010_us_040_00_500k.json',
      nameProperty: 'NAME',
      idProperty: 'GEO_ID'
    });
  }
};
