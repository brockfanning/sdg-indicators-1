(function($, d3, window, document, undefined) {

  // Create the defaults once
  var pluginName = 'sdgMap',
    defaults = {
      serviceUrl: 'https://geoportal1-ons.opendata.arcgis.com/datasets/686603e943f948acaa13fb5d2b0f1275_4.geojson',
      width: 590,
      height: 590,
      nameProperty: 'lad16nm',
      idProperty: 'lad16cd',
      projectionFunc: d3.geoMercator,
    };

  function Plugin(element, options) {
    this.element = element;
    this.options = $.extend({}, defaults, options);

    this._defaults = defaults;
    this._name = pluginName;

    this.geoCodeRegEx = this.options.geoCodeRegEx;

    this.valueRange = [_.min(_.pluck(this.options.geoData, 'Value')), _.max(_.pluck(this.options.geoData, 'Value'))];
    this.colorRange = ['#b4c5c1', '#004433'];

    this.years = _.uniq(_.pluck(this.options.geoData, 'Year'));
    this.currentYear = this.years[0];

    this.noValueFillColor = '#f0f0f0';

    this.init();
  }

  Plugin.prototype = {
    init: function() {
      var mymap = L.map(this.element).setView([55.7656678, -3.7666251], 5);
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Blah blah',
        maxZoom: 18,
        id: 'mapbox.light',
        accessToken: 'pk.eyJ1IjoiYnJvY2tmYW5uaW5nMSIsImEiOiJjaXplbmgzczgyMmRtMnZxbzlmbGJmdW9pIn0.LU-BYMX69uu3eGgk0Imibg'
      }).addTo(mymap);

      var colorScale = chroma.scale(this.colorRange).domain(this.valueRange);
      var that = this;

      function getColor(properties) {
        var geocode = properties[that.options.idProperty];
        var matches = _.where(that.options.geoData, {
          GeoCode: geocode,
          Year: that.currentYear
        });
        if (matches.length) {
          return colorScale(matches[0]['Value']).hex();
        }
        else {
          return that.noValueFillColor;
        }
      }

      function style(feature) {
        return {
          fillColor: getColor(feature.properties),
          weight: 1,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7
        };
      }

      $.getJSON(this.options.serviceUrl, function (geojson) {
        L.geoJson(geojson, {style: style}).addTo(mymap);
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
  $.fn[pluginName] = function(options) {
    return this.each(function() {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
      }
    });
  };
})(jQuery, L, chroma, window, document);
