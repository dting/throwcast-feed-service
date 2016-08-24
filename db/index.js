const mongoose = require('mongoose');
const config = require('../config/environment');
const Promise = require('bluebird');
const Playlist = require('./playlist.model');
const Podcast = require('./podcast.model');
const Station = require('./station.model');

mongoose.Promise = Promise;

module.exports = {
  connect: () => mongoose.connect(config.mongo.uri),
  connection: mongoose.connection,
  Playlist,
  Podcast,
  Station,
};
