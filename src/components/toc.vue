<template>
    <div id="toc" v-if="sharedState.metric.config" class="top left">
        <div>
            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=" class="background-print-img" alt="white background for printing">
            <div class="tocposition">
                <a href="javascript:void(0)" title="Move Table of Contents" v-on:click="position()"><svg class="icon"><use xlink:href="#icon-zoom_out_map"></use></svg></a>
            </div>
            <h1 class="title">COVID 2019 in Singaproe</h1>
            <h2 class="description">
                 <span class="metrictype">DORSCON Level : Orange</span>
            </h2>
			<h2 class="description">
				 <span class="metrictype">Confirmed Case TOTAL: {{ sharedState.metric.config.length }}</span>
            </h2>
			<div class="small">
				<line-chart :chart-data="datacollection"/>
				<!-- <button @click="fillData()">Randomize</button> -->
			</div>
            <!-- <div class="metricboxes">
                <div class="metricbox" v-if="sharedState.metric.config.length > 0">
                    <span class="metricvalue">{{ privateState.metric.config.length }}</span>
                    <span class="metricvalue">{{ privateState.metric.config.date }}</span> 
                    <span v-if="sharedState.metric.config.length > 0" class="metriclabel">{{ sharedState.metric.config.date }}</span> 
                    <span v-if="sharedState.selected.length > 0" class="metric-raw">
                        <span>or</span>
                        <span class="metricvalue metricraw">{{privateState.metric.config.date}}</span>
                        <span v-html="sharedState.metric.config.date.toLowerCase()" class="metriclabel"></span>
                    </span> 
                </div> -->
			<h1 class="title">Singaproe Resident Population, 2016</h1>
                <!-- <div class="metricbox">
                    <span class="metrictype">Singaproe Resident Population, 2016</span>
                    <span class="metricvalue">{{ privateState.area }}</span>
                    <span v-if="sharedState.metric.config.label" class="metriclabel">{{ sharedState.metric.config.label.toLowerCase() }}</span>
                    <span v-if="sharedState.metric.config.raw_label" class="metric-raw">
                        <span>or</span>
                        <span class="metricvalue metricraw">{{privateState.areaRaw}}</span>
                        <span v-html="sharedState.metric.config.raw_label.toLowerCase()" class="metriclabel"></span>
                    </span> 
                </div> -->
            </div>
            <div class="legend">
                <svg  v-if="sharedState.breaks" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 248.4 39.2" id="maplegend" role="img" aria-labelledby="svgTitle">
                    <title id="svgTitle">Choropleth legend</title>
                    <g transform="translate(20.714293 -851.75475)">
                        <rect y="865.9" x="-20.7" height="25" width="50" v-bind:style="{fill: this.sharedState.colors[0]}" v-on:click="selectBreak(0)" v-on:mouseover="highlight(0)" v-on:mouseout="highlight(-1)"  />
                        <rect width="50" height="25" x="28.9" y="865.9" v-bind:style="{fill: this.sharedState.colors[1]}" v-on:click="selectBreak(1)" v-on:mouseover="highlight(1)" v-on:mouseout="highlight(-1)" />
                        <rect width="50" height="25" x="78.5" y="865.9" v-bind:style="{fill: this.sharedState.colors[2]}" v-on:click="selectBreak(2)" v-on:mouseover="highlight(2)" v-on:mouseout="highlight(-1)" />
                        <rect y="865.9" x="128.1" height="25" width="50" v-bind:style="{fill: this.sharedState.colors[3]}" v-on:click="selectBreak(3)" v-on:mouseover="highlight(3)" v-on:mouseout="highlight(-1)" />
                        <rect width="50" height="25" x="177.6" y="865.9" v-bind:style="{fill: this.sharedState.colors[4]}" v-on:click="selectBreak(4)" v-on:mouseover="highlight(4)" v-on:mouseout="highlight(-1)" />
                        <text x="-19.5" y="864.3" class="legendText">
                          <tspan x="-19.5" y="864.3">{{ abbrNumber(sharedState.breaks[0]) }}</tspan>
                        </text>
                        <text y="864.4" x="28.6" class="legendText">
                          <tspan y="864.4" x="28.6">{{ abbrNumber(sharedState.breaks[1]) }}</tspan>
                        </text>
                        <text x="78.4" y="864.4" class="legendText">
                          <tspan x="78.4" y="864.4">{{ abbrNumber(sharedState.breaks[2]) }}</tspan>
                        </text>
                        <text y="864.4" x="128" class="legendText">
                          <tspan y="864.4" x="128">{{ abbrNumber(sharedState.breaks[3]) }}</tspan>
                        </text>
                        <text x="177.8" y="864.4" class="legendText">
                          <tspan x="177.8" y="864.4">{{ abbrNumber(sharedState.breaks[4]) }}</tspan>
                        </text>
                        <text y="864.3" x="225.8" class="legendText">
                          <tspan y="864.3" x="225.8">{{ abbrNumber(sharedState.breaks[5]) }}</tspan>
                        </text>
                    </g>
                </svg>
            </div>
        </div>
    </div>
</template>

<script>
import {
    abbrNum,
    round,
    prettyNumber
} from '../js/number_format';
import {
    metaDescription
} from '../js/meta';
import isNumeric from '../js/isnumeric';
import {
    calcValue,
    wValsToArray,
    sum
} from '../js/metric_calculations';

import LineChart from '../js/LineChart.js'
import virousdata from '../../data/config/COVID.json';

export default {
    name: 'sc-toc',
	components: {
      LineChart
    },
    data () {
      return {
        datacollection: null
      }
    },
	mounted () {
      this.fillData()
    },
    watch: {
        'sharedState.metric': 'processData',
        'sharedState.metadata': 'getMetaDesc',
        'sharedState.selected': 'processSelected',
        'sharedState.year': 'processYear'
    },
    methods: {
        highlight: function (n) {
            if (n === -1) {
                this.sharedState.highlight = [];
            } else {
                this.sharedState.highlight = this.getBreakIds(n);
            }
        },
        selectBreak: function (n) {
            //this.sharedState.selected = this.getBreakIds(n);
        },
        getBreakIds: function (n) {
            let _this = this;
            let data = _this.sharedState.metric.data.features;
            let breaks = _this.sharedState.breaks;
            let ids = [];
            
			// loop through data to get id's
            Object.keys(data).forEach(id => {
                const value = data[id].properties.TOTAL;

                if (value !== null && value >= breaks[n] && value <= breaks[n + 1]) {
                    ids.push(data[id].properties.OBJECTID.toString());
                }
            });

            return ids;
        },

        abbrNumber: function (value) {
            let num = abbrNum(value, 1);
            if (isNumeric(num)) {
                return round(num, this.sharedState.metric.config.decimals);
            } else {
                return num;
            }
        },
        getMetaDesc: function () {
            this.privateState.metaDesc = metaDescription(this.sharedState.metadata).replace('<p>', '').replace('</p>', '').trim();
        },
        processData: function () {
            this.processArea();
            this.processSelected();
        },
        processSelected: function () {
            let metric = this.sharedState.metric;

            let selectedValue = calcValue(metric.data, metric.config.type, this.sharedState.year, this.sharedState.selected);
            this.privateState.selected = prettyNumber(selectedValue, metric.config.decimals, metric.config.prefix, metric.config.suffix);
            if (metric.config.raw_label) {
                let rawArray = wValsToArray(metric.data.map, metric.data.w, [this.sharedState.year], this.sharedState.selected);
                let rawValue = sum(rawArray);
                this.privateState.selectedRaw = prettyNumber(rawValue, 0);
            }
        },
        processArea: function () {
            //let metric = this.sharedState.metric;
            //let keys = Object.keys(metric.data.map);
            //if (metric.config.world_val && metric.config.world_val[`y_${this.sharedState.year}`]) {
            //    this.privateState.area = prettyNumber(metric.config.world_val[`y_${this.sharedState.year}`], metric.config.decimals, metric.config.prefix, metric.config.suffix);
            //} else {
            //    let areaValue = calcValue(metric.data, metric.config.type, this.sharedState.year, keys);
            //    this.privateState.area = prettyNumber(areaValue, metric.config.decimals, metric.config.prefix, metric.config.suffix);
            //}
            //if (metric.config.raw_label) {
            //    let rawArray = wValsToArray(metric.data.map, metric.data.w, [this.sharedState.year], keys);
            //    let rawValue = sum(rawArray);
            //    this.privateState.areaRaw = prettyNumber(rawValue, 0);
            //}
        },
        processYear: function () {
            this.processArea();
            this.processSelected();
        },
        position: function () {
            let el = document.querySelector("#toc");

            // move to top left from bottom right
            if (el.classList.contains("right")) {
                el.classList.remove('bottom');
                el.classList.remove('right');
                el.classList.add('top');
                el.classList.add('left');
            }
            // move to bottom right from bottom left
            else if (el.classList.contains("bottom")) {
                el.classList.remove('left');
                el.classList.add('right');
            }
            // move to bottom left from top left
            else if (el.classList.contains("top")) {
                el.classList.remove('top');
                el.classList.add('bottom');
            }

        },
		fillData () {
        let viousdata = virousdata;
			
		var groupBy = function(xs, key) {
		return xs.reduce(function(rv, x) {
			(rv[x[key]] = rv[x[key]] || []).push(x);
				return rv;
			}, {});
		
		};

		var mm = groupBy(viousdata, 'date');

		const vdate = [];
		const vm = [];
		const vfm = [];
		
		Object.keys(mm).forEach(id => {
             
			 vdate.push(id.toString());
			 
			 var mmsub = groupBy(mm[id], 'gender');
			 if (typeof mmsub.male !== "undefined" && typeof mmsub.female !== "undefined") {			 
					vm.push(mmsub.male.length);
					vfm.push(mmsub.female.length);
		
				} else if (typeof mmsub.male !== "undefined" && typeof mmsub.female == "undefined" ) {
					vm.push(mmsub.male.length);
					vfm.push(0);
				} else if (typeof mmsub.male == "undefined" && typeof mmsub.female !== "undefined" ) {
					vm.push(0);
					vfm.push(mmsub.female.length);
				}
			 
           });

		this.datacollection = {
          labels: vdate,
          datasets: [
            {
              label: 'Male',
              backgroundColor: '#CCFFFF',
              data: vm
            }, {
              label: 'Female',
              backgroundColor: '#FF9999',
              data: vfm
            }
          ]
        }
      }
		
    }
}
</script>

<style>
  .small {
    max-width: 400px;
    margin:  10px auto;
  }
</style>