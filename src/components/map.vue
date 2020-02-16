<template>
  <div class="" style="position: relative; width: 100%; height: 100%">
    <div id="map"></div>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import geojsonDataMerge from '../js/geojsondatamerge';
import {
  prettyNumber
} from '../js/number_format';
import getURLParameter from '../js/geturlparams';
import {
  scaleLinear
} from 'd3-scale';
import geog from '../../data/geography.geojson.json';
import virousgeog from '../../data/config/COVID.geojson.json';

export default {
  name: 'sc-map',
  watch: {
    'sharedState.selected': 'selectNeighborhoods',
    
    'sharedState.year': 'updateYear',
    'sharedState.selected': 'styleNeighborhoods',
    'sharedState.highlight': 'styleNeighborhoods'
  },
  methods: {
    initMap: function () {
      let _this = this;
      _this.privateState.map = new mapboxgl.Map(_this.privateState.mapOptions);

      let map = _this.privateState.map;
		 
      // add nav control
      var nav = new mapboxgl.NavigationControl();
      map.addControl(nav, 'top-right');

      // disable map rotation using right click + drag and touch
      if (_this.privateState.pitch === false) {
        //map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();
      }

      // after map initiated, grab geography and intiate/style neighborhoods
      map.on('load', function () {
        _this.privateState.mapLoaded = true;
        _this.privateState.geoJSON = geog;
        _this.initNeighborhoods();
        _this.styleNeighborhoods();
        _this.initMapEvents();

        if (_this.sharedState.selected.length > 0) {
          _this.zoomNeighborhoods();
        }
      });

    },
    initMapEvents: function () {
      let map = this.privateState.map;
      let _this = this;
      let popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      });

      map.on('mousemove', 'neighborhoods-fill-extrude', function (e) {
        map.getCanvas().style.cursor = 'pointer';
        let feature = e.features[0];
        
        popup
          .setLngLat(map.unproject(e.point))
          .setHTML(
            `<div style="text-align: center; margin: 0; padding: 0;">
			Urban Zone: ${feature.properties.SUBZONE_N}</div>			
			<div style="text-align: center; margin: 0; padding: 0;"> Plan Area: ${feature.properties.PLN_AREA_N}</div>
			<div style="text-align: center; margin: 0; padding: 0;"> Population: ${feature.properties.TOTAL}</div>`
          )
          .addTo(map);
      });

      map.on('mouseleave', 'neighborhoods-fill-extrude', function () {
        map.getCanvas().style.cursor = '';
        popup.remove();
      });

      map.on('rotate', function (e) {
        if (map.getPitch() >= 20) {
          _this.toggle3D();
        } else {
          _this.toggle3D();
        }
      });
    },
    toggle3D: function () {
      let _this = this;
      let map = _this.privateState.map;
      let pitched;

      map.getPitch() >= 20 ? (pitched = true) : (pitched = false);

      if (pitched) {
        map.setLayoutProperty('neighborhoods', 'visibility', 'none');
        map.moveLayer('neighborhoods-fill-extrude');
        map.setPaintProperty(
          'neighborhoods-fill-extrude',
          'fill-extrusion-height',
          _this.getHeight()
        );
      } else {
        map.setLayoutProperty('neighborhoods', 'visibility', 'visible');
        map.moveLayer('neighborhoods-fill-extrude', 'building');
        map.setPaintProperty(
          'neighborhoods-fill-extrude',
          'fill-extrusion-height',
          0
        );
      }
    },
    initNeighborhoods: function () {
      let map = this.privateState.map;
      let _this = this;
      let geoJSON = _this.privateState.geoJSON;

      map.addSource('neighborhoods', {
        type: 'geojson',
        data: geoJSON
      });

      // neighborhood boundaries
      map.addLayer({
          id: 'neighborhoods',
          type: 'line',
          source: 'neighborhoods',
          layout: {},
          paint: {}
        },
        'place_other'
      );

      map.addLayer({
          id: 'neighborhoods-fill-extrude',
          type: 'fill-extrusion',
          source: 'neighborhoods',
          //'filter': ['!=', 'choropleth', 'null'],
          paint: {
            'fill-extrusion-opacity': 0.7
          }
        },
        'building'
      );
	  
      // markers layer
      map.addSource('markers', {
        type: 'geojson',
        data: virousgeog
      });
      map.addLayer({
        id: 'markers',
        type: 'circle',
        source: 'markers',
        /* layout: {
          'icon-image': 'circle-11',
          'icon-size': 1.0,
		  
        } */
		paint: {
		'circle-radius': 10,
		'circle-color': '#ff0000'
		}
      });
	  

	  	map.setPitch(30)
		map.setLayoutProperty('neighborhoods', 'visibility', 'none');
        map.moveLayer('neighborhoods-fill-extrude');
        map.setPaintProperty(
          'neighborhoods-fill-extrude',
          'fill-extrusion-height',
          _this.getHeight()
        );
    },
    selectNeighborhoods: function () {
      if (this.privateState.mapLoaded === true) {
        let map = this.privateState.map;
        let selected = this.sharedState.selected;
        let filter;

        if (selected.length > 0) {
          filter = ['in', 'id'];
          for (let i = 0; i < selected.length; i++) {
            filter.push(selected[i]);
          }
        } else {
          filter = ['in', 'id', '-999999'];
        }

        // push selected state
        let linkMetric = '';
        if (getURLParameter('m')) {
          linkMetric = getURLParameter('m');
        }

        map.setFilter('neighborhoods-line-selected', filter);
        map.setFilter('neighborhoods-fill-selected', filter);
      }
    },
    styleNeighborhoods: function () {
      let map = this.privateState.map;
      let _this = this;

      map.setPaintProperty(
        'neighborhoods-fill-extrude',
        'fill-extrusion-color',
        _this.getColors()
      );
      map.setPaintProperty(
        'neighborhoods',
        'line-color',
        _this.getOutlineColor()
      );
      map.setPaintProperty(
        'neighborhoods',
        'line-width',
        _this.getOutlineWidth()
      );
	  
      if (_this.privateState.isPitched3D) {
        map.setPaintProperty(
          'neighborhoods-fill-extrude',
          'fill-extrusion-height',
          _this.getHeight()
        );
      }
    },
    updateChoropleth: function () {
      let _this = this;
      if (this.privateState.mapLoaded) {
        this.styleNeighborhoods();
      }
    },
    updateBreaks: function () {
      this.privateState.metricId = this.sharedState.metricId;
      this.updateChoropleth();
    },
    updateYear: function () {
      if (this.sharedState.metricId === this.privateState.metricId) {
        this.updateChoropleth();
      }
    },
    geoJSONMerge: function () {
      let _this = this;
      let geoObj = geojsonDataMerge(
        _this.privateState.geoJSON,
        _this.sharedState.metric.data.map,
        _this.sharedState.year
      );
      return geoObj;
    },
    getFullBounds: function () {
      let bounds = new mapboxgl.LngLatBounds();
      let _this = this;

      this.privateState.geoJSON.features.forEach(function (feature) {
        feature.geometry.coordinates.forEach(function (coord) {
          coord.forEach(function (el) {
            bounds.extend(el);
          });
        });
      });

      return bounds;
    },
    zoomNeighborhoods: function () {
      let bounds = new mapboxgl.LngLatBounds();
      let _this = this;

      this.privateState.geoJSON.features.forEach(function (feature) {
        if (_this.sharedState.selected.indexOf(feature.properties.id) !== -1) {
          feature.geometry.coordinates.forEach(function (coord) {
            coord.forEach(function (el) {
              bounds.extend(el);
            });
          });
        }
      });

      this.privateState.map.fitBounds(bounds, {
        padding: 100
      });
    },
    getOutlineColor: function () {
      const stops = [];
      let _this = this;

      _this.sharedState.selected.forEach(id => {
        stops.push([id, '#ba00e4']);
      });

      let outline = {
        property: 'OBJECTID',
        default: 'rgba(0,0,0,1)',
        type: 'categorical',
        stops: stops
      };

      if (stops.length > 0) {
        return outline;
      } else {
        return outline.default;
      }
    },
    getOutlineWidth: function () {
      const stops = [];
      let _this = this;

      _this.sharedState.selected.forEach(id => {
        stops.push([id, 4]);
      });

      let outlineSize = {
        property: 'OBJECTID',
        default: 0.4,
        type: 'categorical',
        stops: stops
      };

      if (stops.length > 0) {
        return outlineSize;
      } else {
        return outlineSize.default;
      }

      return stops;
    },
    getColors: function () {
      const stops = [];
      let _this = this;
	  
	  let feature = _this.privateState.geoJSON.features;
      let id = 1;  
      let data = feature;
	  
      let breaks = [3125,6250,12500,25000,50000,200000];
	  _this.sharedState.breaks = breaks;
      let colors = this.sharedState.colors;

      let color = function (val) {
        if (val <= breaks[1]) {
          return colors[0];
        } else if (val <= breaks[2]) {
          return colors[1];
        } else if (val <= breaks[3]) {
          return colors[2];
        } else if (val <= breaks[4]) {
          return colors[3];
        } else if (val <= breaks[5]) {
          return colors[4];
        }
      };

    Object.keys(data).forEach(id => {
             const value = _this.sharedState.highlight.length;
              
			 if (value !== 0 && id < value) {			 
			    
				stops.push([Number(_this.sharedState.highlight[id]), '#F7E55B']);

             } else if (value == 0 ) {
               stops.push([data[id].properties.OBJECTID, color(data[id].properties.TOTAL)]);
             }
			 
			 
           });
		   
	  
      let fillColor = {
        property: 'OBJECTID',
        default: 'rgb(242,243,240)',
        type: 'categorical',
        stops: stops
      };

      return fillColor;
    },
    getHeight: function () {
      let _this = this;
      const stops = [];
      
	  let feature = _this.privateState.geoJSON.features;
      let id = 1;  
      let data = feature;
	  let hbreaks = [3125,6250,12500,25000,50000,200000];
	  _this.sharedState.breaks = hbreaks;
      let heightAdjust = scaleLinear()
        .domain([
          hbreaks,
          hbreaks[hbreaks.length - 1]
        ])
        .range([0, 200000]);

      Object.keys(data).forEach(id => {
        const value = data[id].properties.TOTAL;
        if (value !== null) {
          stops.push([data[id].properties.OBJECTID, value/100]);
        }
      });
	  
      let height = {
        property: 'OBJECTID',
        default: 0,
        type: 'categorical',
        stops: stops
      };

      return height;
    }
  },
  mounted: function () {
    this.initMap();
  }
};
</script>