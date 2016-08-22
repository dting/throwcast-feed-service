const _ = require('lodash');

const baseSettings = {
  env: process.env.NODE_ENV || 'development',
};

const environmentSettings = require(`./${baseSettings.env}`);

module.exports = _.merge(baseSettings, environmentSettings || {});
