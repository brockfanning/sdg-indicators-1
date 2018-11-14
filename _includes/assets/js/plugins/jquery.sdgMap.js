(function($, L, chroma, window, document, undefined) {

  // Create the defaults once
  var defaults = {
    // Info relevant to the source GeoJSON data.
    serviceUrl: 'https://geoportal1-ons.opendata.arcgis.com/datasets/686603e943f948acaa13fb5d2b0f1275_4.geojson',
    nameProperty: 'lad16nm',
    idProperty: 'lad16cd',
    // Options for using tile imagery with leaflet.
    tileURL: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
    tileOptions: {
      id: 'mapbox.light',
      accessToken: 'pk.eyJ1IjoiYnJvY2tmYW5uaW5nMSIsImEiOiJjaXplbmgzczgyMmRtMnZxbzlmbGJmdW9pIn0.LU-BYMX69uu3eGgk0Imibg',
      attribution: 'Blah blah',
      minZoom: 5,
      maxZoom: 12,
    },
    styleOptions: {
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    },
    styleOptionsHover: {
      weight: 3,
      color: '#666',
      dashArray: '',
    },
    // Visual/choropleth considerations.
    colorRange: ['#b4c5c1', '#004433'],
    noValueColor: '#f0f0f0',
    legendItems: 5,
    // Placement of map controls.
    legendPosition: 'bottomright',
    sliderPosition: 'bottomleft',
    infoPosition: 'topright',
  };

  function Plugin(element, options) {

    this.element = element;
    this.options = $.extend({}, defaults, options);

    this._defaults = defaults;
    this._name = 'sdgMap';

    this.geoCodeRegEx = this.options.geoCodeRegEx;

    this.valueRange = [_.min(_.pluck(this.options.geoData, 'Value')), _.max(_.pluck(this.options.geoData, 'Value'))];
    this.colorScale = chroma.scale(this.options.colorRange)
      .domain(this.valueRange)
      .classes(this.options.legendItems);

    this.years = _.uniq(_.pluck(this.options.geoData, 'Year'));
    this.currentYear = this.years[0];

    // Track the selected GeoJSON feature.
    this.selectedFeature = null;

    // These variables will be set later.
    this.selectedFields = [];
    this.layer = null;

    this.style = function(plugin) {
      return function(feature) {
        return $.extend({}, plugin.options.styleOptions, {
          fillColor: plugin.getColor(feature.properties),
        });
      }
    }(this);

    this.init();
  }

  Plugin.prototype = {

    // Update the map according according to the currently-selected fields.
    updateSelectedFields: function(selectedFields) {
      this.selectedFields = selectedFields;
      this.updateColors();
    },

    // Update the colors of the Features on the map.
    updateColors: function() {
      this.layer.setStyle(this.style);
    },

    // Get the local (CSV) data corresponding to a GeoJSON "feature" with the
    // corresponding data.
    getData: function(props) {
      var geocode = props[this.options.idProperty];
      var matches = _.where(this.options.geoData, {
        GeoCode: geocode,
        Year: this.currentYear
      });
      if (matches.length) {
        return matches[0];
      }
      else {
        return false;
      }
    },

    // Choose a color for a GeoJSON feature.
    getColor: function(props) {
      var localData = this.getData(props);
      if (localData) {
        return this.colorScale(localData['Value']).hex();
      }
      else {
        return this.options.noValueColor;
      }
    },

    init: function() {

      // Create the map.
      var map = L.map(this.element);

      // Add tile imagery.
      L.tileLayer(this.options.tileURL, this.options.tileOptions).addTo(map);

      // Because after this point, "this" rarely works.
      var plugin = this;

      // Helper function to round values for the legend.
      function round(value) {
        return Math.round(value * 100) / 100;
      }

      // Add the legend.
      var legend = L.control();
      legend.onAdd = function() {
        var div = L.DomUtil.create('div', 'control legend');
        var grades = chroma.limits(plugin.valueRange, 'e', plugin.options.legendItems);
        for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
            '<i style="background:' + plugin.colorScale(grades[i]).hex() + '"></i> ' +
              round(grades[i]) + (grades[i + 1] ? '&ndash;' + round(grades[i + 1]) + '<br>' : '+');
        }
        return div;
      }
      legend.setPosition(this.options.legendPosition);
      legend.addTo(map);

      // Add the slider.
      var slider = L.control();
      slider.onAdd = function() {
        var div = L.DomUtil.create('div', 'control');
        var year = L.DomUtil.create('div', 'current-year', div);
        year.innerHTML = 'Showing year: <strong>' + plugin.currentYear + '</strong>';
        var input = L.DomUtil.create('input', 'slider', div);
        L.DomEvent.disableClickPropagation(input);
        // Add a bunch of attributes.
        input.type = 'range';
        input.min = 0;
        input.max = plugin.years.length - 1;
        input.value = 0;
        input.step = 1;
        input.oninput = function() {
          plugin.currentYear = plugin.years[input.value];
          year.innerHTML = 'Showing year: <strong>' + plugin.currentYear + '</strong>'
          plugin.updateColors();
        }
        return div;
      }
      slider.setPosition(this.options.sliderPosition);
      slider.addTo(map);

      // Add the info pane.
      var info = L.control();
      info.onAdd = function() {
        this._div = L.DomUtil.create('div', 'control info');
        this.update();
        return this._div;
      }
      info.update = function(props) {
        var infoMarkup = '';
        if (props) {
          infoMarkup = '<p>' + props[plugin.options.nameProperty] + '</p>';
          var localData = plugin.getData(props);
          infoMarkup += (localData['Value']) ? '<h4>' + localData['Value'] + '</h4>' : 'No data available';
        }
        this._div.innerHTML = infoMarkup;
      }
      info.setPosition(this.options.infoPosition);
      info.addTo(map);

      // At this point we need to load the GeoJSON layer.
      $.getJSON(this.options.serviceUrl, function (geojson) {

        // Add the GeoJSON layer to the map.
        plugin.layer = L.geoJson(geojson, {
          style: plugin.style,
          onEachFeature: onEachFeature
        }).addTo(map);

        // Zoom to a feature.
        function zoomToFeature(layer) {
          map.fitBounds(layer.getBounds());
        }

        // Highlight a feature.
        function highlightFeature(layer) {
          layer.setStyle(plugin.options.styleOptionsHover);
          info.update(layer.feature.properties);

          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
          }
        }

        // Un-highlight a feature.
        function unHighlightFeature(layer) {
          plugin.layer.resetStyle(layer);
          info.update();
        }

        // Event handler for click/touch.
        function clickHandler(e) {
          var layer = e.target;
          // Clicking "selects" a feature.
          if (plugin.selectedFeature) {
            unHighlightFeature(plugin.selectedFeature);
          }
          plugin.selectedFeature = layer;
          // Zoom in.
          zoomToFeature(layer);
          // Highlight the feature.
          highlightFeature(layer);
        }

        // Event handler for mouseover.
        function mouseoverHandler(e) {
          var layer = e.target;
          // Disable mouseover if the user has selected a feature.
          if (plugin.selectedFeature) {
            return;
          }
          highlightFeature(layer);
        }

        // Event handler for mouseout.
        function mouseoutHandler(e) {
          var layer = e.target;
          // Disable mouseout if the user has selected a feature.
          if (plugin.selectedFeature) {
            return;
          }
          unHighlightFeature(layer);
        }

        // Set all event listeners.
        function onEachFeature(feature, layer) {
          layer.on({
            click: clickHandler,
            mouseover: mouseoverHandler,
            mouseout: mouseoutHandler,
          });
        }
      });

      // Leaflet needs "invalidateSize()" if it was originally rendered in a
      // hidden element. So we need to do that when the tab is clicked.
      $('.map .nav-link').click(function() {
        setTimeout(function() {
          jQuery('#map #loader-container').hide();
          // Fix the size.
          map.invalidateSize();
          // Also zoom in/out as needed.
          map.fitBounds(plugin.layer.getBounds());
        }, 500);
      });
    },
    // Stll needed?
    isInScope: function(d) {
      return d === null ? true : d.properties[this.options.idProperty].match(this.options.geoCodeRegEx);
    }
  };

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn['sdgMap'] = function(options, alternateOptions) {
    return this.each(function() {
      if (typeof options === 'string') {
        if (options == 'update') {
          if ($.data(this, 'plugin_sdgMap')) {
            $.data(this, 'plugin_sdgMap').updateSelectedFields(alternateOptions);
          }
        }
      }
      else {
        if (!$.data(this, 'plugin_sdgMap')) {
          $.data(this, 'plugin_sdgMap', new Plugin(this, options));
        }
      }
    });
  };
})(jQuery, L, chroma, window, document);
