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
      maxZoom: 8,
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
    // Visual/choropleth considerations.
    colorRange: ['#b4c5c1', '#004433'],
    noValueColor: '#f0f0f0',
    legendItems: 5,
    legendPosition: 'bottomright',
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

    this.init();
  }

  Plugin.prototype = {
    init: function() {
      // Create the map and set the starting position.
      var mymap = L.map(this.element)
        .setView([this.options.startingLatitude, this.options.startingLongitde], this.options.startingZoom);
      // Add tiles if necessary.
      if (this.options.leafletTiles) {
        L.tileLayer(this.options.leafletTileURL, this.options.leafletTileOptions).addTo(mymap);
      }
      // Because after this point, "this" rarely works.
      var that = this;

      // A function to get the local (CSV) data corresponding to a GeoJSON
      // "feature" with the corresponding data.
      function getLocalData(properties) {
        var geocode = properties[that.options.idProperty];
        var matches = _.where(that.options.geoData, {
          GeoCode: geocode,
          Year: that.currentYear
        });
        if (matches.length) {
          return matches[0];
        }
        else {
          return false;
        }
      }

      // A function to choose a color for a GeoJSON feature.
      function getColor(properties) {
        var localData = getLocalData(properties);
        if (localData) {
          return that.colorScale(localData['Value']).hex();
        }
        else {
          return that.options.noValueColor;
        }
      }

      // A function to style each "Feature" in the GeoJSON layer.
      function style(feature) {
        // All the Features will be the same other than fillColor.
        return $.extend({}, that.options.leafletStyle, {
          fillColor: getColor(feature.properties),
        });
      }

      // A function to generate the markup for the legend.
      function getLegendMarkup() {
        var div = L.DomUtil.create('div', 'info legend');
        var grades = chroma.limits(that.valueRange, 'e', that.options.legendItems);

        function round(value) {
          return Math.round(value * 100) / 100;
        }

        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + that.colorScale(grades[i]).hex() + '"></i> ' +
                round(grades[i]) + (grades[i + 1] ? '&ndash;' + round(grades[i + 1]) + '<br>' : '+');
        }

        return div;
      }

      // Load the remote GeoJSON file.
      $.getJSON(this.options.serviceUrl, function (geojson) {
        // Add the GeoJSON layer to the map.
        L.geoJson(geojson, {style: style}).addTo(mymap);

        // Add the legend.
        var legend = L.control({position: that.options.legendPosition});
        legend.onAdd = getLegendMarkup;
        legend.addTo(mymap);
      });

      // Leaflet needs "invalidateSize()" if it was originally rendered in a
      // hidden element. So we need to do that when the tab is clicked.
      $('.map .nav-link').click(function() {
        setTimeout(function() {
          jQuery('#map .loader').hide();
          mymap.invalidateSize();
        }, 500);
      });
    },
    isInScope: function(d) {
      return d === null ? true : d.properties[this.options.idProperty].match(this.options.geoCodeRegEx);
    }
  };

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn['sdgMap'] = function(options) {
    return this.each(function() {
      if (!$.data(this, 'plugin_sdgMap')) {
        $.data(this, 'plugin_sdgMap', new Plugin(this, options));
      }
    });
  };
})(jQuery, L, chroma, window, document);
