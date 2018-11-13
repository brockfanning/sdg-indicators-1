var mapView = function () {

  "use strict";

  this.initialise = function(geoData, geoCodeRegEx) {
    $('.map').show();
    $('#map').sdgMap({
      geoData: geoData,
      geoCodeRegEx: geoCodeRegEx,
    });
  };

  this.update = function(selectedFields) {
    $('#map').sdgMap('update', selectedFields).updateColors();
  }
};
