
const packageInfo = require('../package.json');

const provider = {
  type: 'provider',
  name: 'koop-provider-csv-cofid-esri',
  version: packageInfo.version,
  hosts: true,
  disableIdParam: true,
  Model: require('./model')
};

module.exports = provider;
