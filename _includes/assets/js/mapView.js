var mapView = function () {

  "use strict";
  //---#1 GoalDependendMapColor---start--------------------------------------
  //this.initialise = function(geoData, geoCodeRegEx) {
  this.initialise = function(indicatorId, goal) {
  //---#1 GoalDependendMapColor---stop---------------------------------------
    $('.map').show();
    $('#map').sdgMap({
      indicatorId: indicatorId,
      mapOptions: {{ site.map_options | jsonify }},
      mapLayers: {{ site.map_layers | jsonify }},
      //---#1 GoalDependendMapColor---start--------------------------------------
      goal: goal,
      //---#1 GoalDependendMapColor---stop---------------------------------------
      //title: title
    });
  };
};
