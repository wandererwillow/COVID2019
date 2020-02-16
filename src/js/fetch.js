import dataConfig from '../../data/config/COVID.json';
import basedata from '../../data/geography.geojson.json';
import jenksBreaks from './jenksbreaks';
import dataSummary from './datasummary';

export default function fetchData(appState, metric) {
  appState.metricId = metric;


	  
  // fetch data
   fetch(`../../data/geography.geojson.json`)
    .then(function(response) {
      return response;
    })
    .then(function(data) { 
      /* let nKeys = Object.keys(data.features);
      let yKeys = Object.keys(data.features[nKeys[0]]);
      let years = yKeys.features(function(el) {
        return el.replace('y_', '');
      });

      // drop invalid selected values
      for (let i = 0; i < appState.selected.length; i++) {
        if (nKeys.indexOf(appState.selected[i]) === -1) {
          let pos = appState.selected.indexOf(appState.selected[i]);
          appState.selected.splice(pos, 1);
        }
      } */

       appState.metric = {
        config: dataConfig,
        years: 2020,
        data: basedata
      };

      // replace year if previous year doesn't exist in data
      /* if (years.indexOf(appState.year) === -1) {
        appState.year = years[years.length - 1];
      }
      appState.breaks = jenksBreaks(data.map, years, nKeys, 5);

      // send back summary data
      if (window != window.top) {
        parent.postMessage(
          {
            summary: dataSummary(appState)
          },
          '*'
        );
      } */
     })
    .catch(function(ex) {
      console.log('parsing failed', ex);
    }); 

  // fetch metadata
/*   fetch(`./data/meta/m${metric}.html`)
    .then(function(response) {
      return response.text();
    })
    .then(function(data) {
      appState.metadata = data;
    })
    .catch(function(ex) {
      console.log('parsing failed', ex);
    }); */
}