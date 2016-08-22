const mongoose = require('mongoose');
const config = require('../config/environment');
const Promise = require('bluebird');
const Station = require('./station.model');
const Podcast = require('./podcast.model');

mongoose.Promise = Promise;

module.exports = {
  connect: () => mongoose.connect(config.mongo.uri),
  connection: mongoose.connection,
  Station,
  Podcast,
};
