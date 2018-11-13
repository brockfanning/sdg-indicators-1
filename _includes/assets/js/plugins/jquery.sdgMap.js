(function($, L, chroma, window, document, undefined) {

  // Create the defaults once
  var defaults = {
    // Info relevant to the source GeoJSON data.
    serviceUrl: 'https://geoportal1-ons.opendata.arcgis.com/datasets/686603e943f948acaa13fb5d2b0f1275_4.geojson',
    nameProperty: 'lad16nm',
    idProperty: 'lad16cd',
    startingLatitude: 55.7656678,
    startingLongitde: -3.7666251,
    startingZoom: 5,
    // Options for using tile imagery with leaflet.
    leafletTiles: true,
    leafletTileURL: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
    leafletTileOptions: {
      attribution: 'Blah blah',
      minZoom: 5,
      maxZoom: 12,
      id: 'mapbox.light',
      accessToken: 'pk.eyJ1IjoiYnJvY2tmYW5uaW5nMSIsImEiOiJjaXplbmgzczgyMmRtMnZxbzlmbGJmdW9pIn0.LU-BYMX69uu3eGgk0Imibg'
    },
    leafletStyle: {
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    },
    leafletHoverStyle: {
      weight: 3,
      color: '#666',
      dashArray: '',
    },
    // Visual/choropleth considerations.
    colorRange: ['#b4c5c1', '#004433'],
    noValueColor: '#f0f0f0',
    legendItems: 5,
    legendPosition: 'bottomright',
    sliderPosition: 'bottomleft',
    infoPosition: 'topright',
  };

  // Some functions that will be used in multiple places.


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

    this.featureStyle = function(plugin) {
      return function(feature) {
        return $.extend({}, plugin.options.leafletStyle, {
          fillColor: plugin.getColorOfFeature(feature.properties),
        });
      }
    }(this);

    this.init();
  }

  Plugin.prototype = {
    // A function called through jQuery to update the data according to the
    // currently-selected fields.
    updateSelectedFields: function(selectedFields) {
      console.log(selectedFields);
    },
    // A function to update the colors of the Features on the map.
    updateColors: function() {
      this.geojsonLayer.setStyle(this.featureStyle);
    },
    // A function to get the local (CSV) data corresponding to a GeoJSON
    // "feature" with the corresponding data.
    getLocalDataForFeature: function(featureProperties) {
      var geocode = featureProperties[this.options.idProperty];
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
    // A function to choose a color for a GeoJSON feature.
    getColorOfFeature: function(properties) {
      var localData = this.getLocalDataForFeature(properties);
      if (localData) {
        return this.colorScale(localData['Value']).hex();
      }
      else {
        return this.options.noValueColor;
      }
    },
    // A function to get the legend.
    getLegend: function() {
      var plugin = this;
      var legend = L.Control.extend({
        onAdd: function() {
          function round(value) {
            return Math.round(value * 100) / 100;
          }
          var div = L.DomUtil.create('div', 'control legend');
          var grades = chroma.limits(plugin.valueRange, 'e', plugin.options.legendItems);
          for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
              '<i style="background:' + plugin.colorScale(grades[i]).hex() + '"></i> ' +
                round(grades[i]) + (grades[i + 1] ? '&ndash;' + round(grades[i + 1]) + '<br>' : '+');
          }

          return div;
        },
      });
      return new legend({position: plugin.options.legendPosition});
    },
    // A function to get the slider.
    getSlider: function() {
      var plugin = this;
      var slider = L.Control.extend({
        onAdd: function() {
          var div = L.DomUtil.create('div', 'control');
          var yearLabel = L.DomUtil.create('div', 'current-year', div);
          var sliderElement = L.DomUtil.create('input', 'slider', div);
          L.DomEvent.disableClickPropagation(sliderElement);
          // Add a bunch of attributes.
          sliderElement.type = 'range';
          sliderElement.min = 0;
          sliderElement.max = plugin.years.length - 1;
          sliderElement.value = 0;
          sliderElement.step = 1;
          sliderElement.oninput = function() {
            plugin.currentYear = plugin.years[this.value];
            yearLabel.innerHTML = 'Showing year: <strong>' + plugin.currentYear + '</strong>';
            plugin.updateColors();
          }
          return div;
        },
      });
      return new slider({position: plugin.options.sliderPosition});
    },
    // A function to get the info pane.
    getInfoPane: function() {
      var plugin = this;
      var info = L.Control.extend({
        onAdd: function() {
          this._div = L.DomUtil.create('div', 'control info');
          this.update();
          return this._div;
        },
        update: function(props) {
          var infoMarkup = '';
          if (props) {
            infoMarkup = '<p>' + props[plugin.options.nameProperty] + '</p>';
            var localData = plugin.getLocalDataForFeature(props);
            infoMarkup += (localData['Value']) ? '<h4>' + localData['Value'] + '</h4>' : 'No data available';
          }
          this._div.innerHTML = infoMarkup;
        }
      });
      return new info({position: plugin.options.infoPosition});
    },
    init: function() {
      // Create the map and set the starting position.
      this.map = L.map(this.element)
        .setView([this.options.startingLatitude, this.options.startingLongitde], this.options.startingZoom);
      // Add tiles if necessary.
      if (this.options.leafletTiles) {
        L.tileLayer(this.options.leafletTileURL, this.options.leafletTileOptions).addTo(this.map);
      }

      // Because after this point, "this" rarely works.
      var that = this;

      // Function to zoom to the clicked feature.
      function zoomToFeature(e) {
        that.map.fitBounds(e.target.getBounds());
      }

      // Function highlight the hovered feature.
      function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle(that.options.leafletHoverStyle);
        that.infoPane.update(layer.feature.properties);

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          layer.bringToFront();
        }
      }

      // Function to un-highlight the un-hovered feature.
      function resetHighlight(e) {
        that.geojsonLayer.resetStyle(e.target);
        that.infoPane.update();
      }

      // Function to set all event listeners.
      function onEachFeature(feature, layer) {
        layer.on({
          click: zoomToFeature,
          mouseover: highlightFeature,
          mouseout: resetHighlight
        });
      }

      // Load the remote GeoJSON file.
      $.getJSON(this.options.serviceUrl, function (geojson) {
        // Add the GeoJSON layer to the map.
        that.geojsonLayer = L.geoJson(geojson, {
          style: that.featureStyle,
          onEachFeature: onEachFeature
        }).addTo(that.map);

        // Add the legend.
        that.getLegend().addTo(that.map);

        // Add the slider.
        that.getSlider().addTo(that.map);

        // Add the info pane.
        that.infoPane = that.getInfoPane().addTo(that.map);

      });

      // Leaflet needs "invalidateSize()" if it was originally rendered in a
      // hidden element. So we need to do that when the tab is clicked.
      $('.map .nav-link').click(function() {
        setTimeout(function() {
          jQuery('#map #loader-container').hide();
          that.map.invalidateSize();
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
