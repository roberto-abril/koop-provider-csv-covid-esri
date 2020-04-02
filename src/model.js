const fs = require('fs');
const neatCsv = require('neat-csv');
const request = require('request');
const config = require('../config/default.json');
const provinces = require('../es_ine_provinces.json');

function Model (koop) {}

Model.prototype.getData = function (req, callback) {
  const geojson = {
    type: 'FeatureCollection',
    features: []
  };

  Step01_LoadFile(function (items) {
    geojson.features = items;
    geojson.metadata = {
        name: "Afectados",
        idField: "id",
        geometryType: "MultiPolygon",
        fields:[
          { name: 'id', type: 'Integer', alias: 'ID'},
          { name: 'new_cases', type: 'Integer', alias: 'Nuevos casos'},
          { name: 'cases_accumulated', type: 'Integer', alias: 'Casos acumulados'}

        ]
        /*,
        drawingInfo: require('./symbologyDefinition/heatmap_restaurant.js')*/
    }
    //fs.writeFileSync('./example.json',JSON.stringify(geojson));

    callback(null, geojson)
  });

};
async function Step01_LoadFile(callback) {

  request(config.url, function (err, response, body) {
    var items = [];
    if (err) {
      console.error(err);
      callback(items);
    } else {
      Step02_ConvertData(body,callback);
    }
  });
}
async function Step02_ConvertData(rows,callback){
  var cols = ["province","date","ccaa","new_cases","activos","hospitalized","intensive_care","deceased","cases_accumulated","recovered","source","comments","poblacion","ine_code","cases_per_cienmil","intensive_care_per_1000000","deceassed_per_100000"];
  rows = await neatCsv(rows);
  var dic = {};
  for (var row in rows) {
    var properties = {id:row,idField:row};
    for(var x = 0; x < cols.length; x++){
      if(!isNaN(rows[row][cols[x]])){
        properties[cols[x]] = parseInt(rows[row][cols[x]]);
      }else{
        properties[cols[x]] = rows[row][cols[x]];  
      }
      
    }

    var feature = {
      type: 'Feature',
      properties: properties,
      geometry: provinces[properties.ine_code]?provinces[properties.ine_code]:{}
    };
    dic[properties.ine_code] = feature;
  }

  var items = [];
  for(var d in dic)
    items.push(dic[d]);
  callback(items);
}

module.exports = Model;
