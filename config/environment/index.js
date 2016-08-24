const _ = require('lodash');

const baseSettings = {
  env: process.env.NODE_ENV || 'development',
  elastic: { hosts: ['localhost:9200'] },
};

const environmentSettings = require(`./${baseSettings.env}`);

module.exports = _.merge(baseSettings, environmentSettings || {});
