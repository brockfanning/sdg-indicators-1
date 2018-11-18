/**
 * Notes:
 *
 * On load:
 *  - load all GeoJSON files and attach them as layers, but only one will be visible
 *  - each layer has its own style options
 * On feature click:
 *  - zoom to clicked feature
 *  - select clicked feature
 *  - update info pane about clicked feature
 * On zoom end:
 *  - show/hide layers as needed
 *  - if hiding a layer with a selected feature, unselect and remove info from pane
 *
 * Takeaways:
 * 1. The default layer will always be visible but not always clickable.
 * 2. For sanity, the lower layers should not receive choropleth colors, only outlines
 */
(function($, L, chroma, window, document, undefined) {

  // Create the defaults once
  var defaults = {
    geoLayers: [
      {
        min_zoom: 0,
        max_zoom: 7,
        serviceUrl: '/sdg-indicators/public/parents.geo.json',
        nameProperty: 'rgn17nm',
        idProperty: 'rgn17cd',
        noData: 'No data available at the region level',
        styleOptions: {
          weight: 1,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7
        },
        styleOptionsSelected: {
          weight: 3,
          color: '#666',
          dashArray: '',
        }
      },
      {
        min_zoom: 8,
        max_zoom: 20,
        serviceUrl: '/sdg-indicators/public/children.geo.json',
        nameProperty: 'lad16nm',
        idProperty: 'lad16cd',
        noData: 'No data available for this district',
        styleOptions: {
          weight: 1,
          opacity: 1,
          color: 'yellow',
          dashArray: '3',
          fillOpacity: 0.7
        },
        styleOptionsSelected: {
          weight: 3,
          color: '#222',
          dashArray: '',
        }
      }
    ],
    // Options for using tile imagery with leaflet.
    tileURL: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
    tileOptions: {
      id: 'mapbox.light',
      accessToken: 'pk.eyJ1IjoiYnJvY2tmYW5uaW5nMSIsImEiOiJjaXplbmgzczgyMmRtMnZxbzlmbGJmdW9pIn0.LU-BYMX69uu3eGgk0Imibg',
      attribution: 'Blah blah',
      minZoom: 5,
      maxZoom: 12,
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

    this.valueRange = [_.min(_.pluck(this.options.geoData, 'Value')), _.max(_.pluck(this.options.geoData, 'Value'))];
    this.colorScale = chroma.scale(this.options.colorRange)
      .domain(this.valueRange)
      .classes(this.options.legendItems);

    this.years = _.uniq(_.pluck(this.options.geoData, 'Year'));
    this.currentYear = this.years[0];

    // Track the selected GeoJSON feature.
    this.selectedFeature = null;

    // Use the ZoomShowHide library to control visibility ranges.
    this.zoomShowHide = new ZoomShowHide();

    // These variables will be set later.
    this.selectedFields = [];
    this.map = null;

    this.init();
  }

  Plugin.prototype = {

    // Update the map according according to the currently-selected fields.
    updateSelectedFields: function(selectedFields) {
      this.selectedFields = selectedFields;
      this.updateColors();
    },

    // Get all of the GeoJSON layers.
    getAllLayers: function() {
      return L.featureGroup(this.zoomShowHide.layers);
    },

    // Get only the visible GeoJSON layers.
    getVisibleLayers: function() {
      // Unfortunately relies on an internal of the ZoomShowHide library.
      return this.zoomShowHide._layerGroup;
    },

    // Update the colors of the Features on the map.
    updateColors: function() {
      var plugin = this;
      this.getAllLayers().eachLayer(function(layer) {
        layer.setStyle(function(feature) {
          return { fillColor: plugin.getColor(feature.properties, layer.sdgOptions.idProperty) }
        });
      });
    },

    // Get the local (CSV) data corresponding to a GeoJSON "feature" with the
    // corresponding data.
    getData: function(geocode) {
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
    getColor: function(props, idProperty) {
      var localData = this.getData(props[idProperty]);
      if (localData) {
        return this.colorScale(localData['Value']).hex();
      }
      else {
        return this.options.noValueColor;
      }
    },

    // Zoom to a feature.
    zoomToFeature: function(layer) {
      this.map.fitBounds(layer.getBounds());
    },

    init: function() {

      // Create the map.
      this.map = L.map(this.element);
      this.map.setView([0, 0], 0);
      this.zoomShowHide.addTo(this.map);

      // Add tile imagery.
      L.tileLayer(this.options.tileURL, this.options.tileOptions).addTo(this.map);

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
      legend.addTo(this.map);

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
      slider.addTo(this.map);

      // Add the info pane.
      var info = L.control();
      info.onAdd = function() {
        this._div = L.DomUtil.create('div', 'control info');
        this.update();
        return this._div;
      }
      info.update = function(layer) {
        if (this._div) {
          this._div.innerHTML = '';
        }
        if (layer) {
          var props = layer.feature.properties;
          var name = L.DomUtil.create('p', 'info-name', this._div);
          name.innerHTML = props[layer.options.sdgLayer.nameProperty];
          var localData = plugin.getData(props[layer.options.sdgLayer.idProperty]);
          var value;
          if (localData['Value']) {
            value = L.DomUtil.create('h4', 'info-value', this._div);
            value.innerHTML = localData['Value'];
          }
          else {
            value = L.DomUtil.create('p', 'info-no-data', this._div);
            value.innerHTML = layer.options.sdgLayer.noData;
          }
        }
      }
      info.setPosition(this.options.infoPosition);
      info.addTo(this.map);

      // At this point we need to load the GeoJSON layer/s.
      var geoURLs = this.options.geoLayers.map(function(item) {
        return $.getJSON(item.serviceUrl);
      });
      $.when.apply($, geoURLs).done(function() {

        function onEachFeature(feature, layer) {
          //feature.sdgLayerOptions = this.sdgLayerOptions;
          layer.on({
            click: clickHandler,
          });
        }

        var geoJsons = arguments;
        for (var i in geoJsons) {
          var layer = L.geoJson(geoJsons[i], {
            // Tack on the custom options here to access them later.
            sdgLayer: plugin.options.geoLayers[i],
            style: plugin.options.geoLayers[i].styleOptions,
            onEachFeature: onEachFeature,
          });
          layer.min_zoom = plugin.options.geoLayers[i].min_zoom;
          layer.max_zoom = plugin.options.geoLayers[i].max_zoom;
          // Store our custom options here, for easier access.
          layer.sdgOptions = plugin.options.geoLayers[i];
          // Add the layer to the ZoomShowHide group.
          plugin.zoomShowHide.addLayer(layer);
        }
        plugin.updateColors();

        // Highlight a feature.
        function highlightFeature(layer) {
          layer.setStyle(layer.options.sdgLayer.styleOptionsSelected);
          info.update(layer);

          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
          }
        }

        // Un-highlight a feature.
        function unHighlightFeature(layer) {
          layer.setStyle(layer.options.sdgLayer.styleOptions);
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
          plugin.zoomToFeature(layer);
          // Highlight the feature.
          highlightFeature(layer);
        }
      });

      // Leaflet needs "invalidateSize()" if it was originally rendered in a
      // hidden element. So we need to do that when the tab is clicked.
      $('.map .nav-link').click(function() {
        setTimeout(function() {
          jQuery('#map #loader-container').hide();
          // Fix the size.
          plugin.map.invalidateSize();
          // Also zoom in/out as needed.
          plugin.zoomToFeature(plugin.getVisibleLayers());
        }, 500);
      });
    },
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
