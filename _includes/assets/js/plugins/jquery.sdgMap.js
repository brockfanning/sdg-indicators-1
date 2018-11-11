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
    // Leaflet configuration.
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
    // Choropleth considerations.
    colorRange: ['#b4c5c1', '#004433'],
    noValueColor: '#f0f0f0',
    legendItems: 5
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
      var mymap = L.map(this.element)
        .setView([this.options.startingLatitude, this.options.startingLongitde], this.options.startingZoom);
      L.tileLayer(this.options.leafletTileURL, this.options.leafletTileOptions).addTo(mymap);

      var that = this;

      function getColor(properties) {
        var geocode = properties[that.options.idProperty];
        var matches = _.where(that.options.geoData, {
          GeoCode: geocode,
          Year: that.currentYear
        });
        if (matches.length) {
          return that.colorScale(matches[0]['Value']).hex();
        }
        else {
          return that.options.noValueColor;
        }
      }

      function style(feature) {
        return $.extend({}, that.options.leafletStyle, {
          fillColor: getColor(feature.properties),
        });
      }

      $.getJSON(this.options.serviceUrl, function (geojson) {
        L.geoJson(geojson, {style: style}).addTo(mymap);

        var legend = L.control({position: 'bottomright'});
        legend.onAdd = function (map) {

          var div = L.DomUtil.create('div', 'info legend'),
              grades = chroma.limits(that.valueRange, 'e', that.options.legendItems);

          function round(value) {
            return Math.round(value * 100) / 100;
          }

          for (var i = 0; i < grades.length; i++) {
              div.innerHTML +=
                  '<i style="background:' + that.colorScale(grades[i]).hex() + '"></i> ' +
                  round(grades[i]) + (grades[i + 1] ? '&ndash;' + round(grades[i + 1]) + '<br>' : '+');
          }

          return div;
        };

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
