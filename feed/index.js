const logger = require('winston');
const _ = require('lodash');

const utils = require('../utils');
const { Playlist, Podcast, Station } = require('../db');

const updateStation = function updateStation(doc) {
  return ({ station, episodes }) => {
    if (doc.updated.valueOf() === station.updated.valueOf()) {
      logger.debug(`No station changes for: ${doc.title}`);
      return { station: doc, episodes };
    }
    logger.info(`Updating station: ${station.title}`);
    _.extend(doc, station);
    return doc.save().then(saved => ({ station: saved, episodes }));
  };
};

const stationHandler = function stationHandler(p, station) {
  return p.then(() => utils.fetch(station.feed))
    .then(updateStation(station))
    .then(utils.updateEpisodes);
};

const update = function update() {
  return Station.find({})
    .then(stations => stations.reduce(stationHandler, Promise.resolve()))
    .then(utils.syncronize(Playlist, 'Playlists'))
    .then(utils.syncronize(Podcast, 'Podcasts'))
    .then(utils.syncronize(Station, 'Stations'))
    .catch(logger.error);
};

module.exports = { update };
