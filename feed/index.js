const logger = require('winston');
const _ = require('lodash');
const utils = require('../utils');
const { Station, Podcast } = require('../db');

const applyStationUpdate = function applyStationUpdate(station) {
  return parsedUpdate => {
    if (station.updated.valueOf() === parsedUpdate.station.updated.valueOf()) {
      return parsedUpdate.episodes;
    }
    logger.info(`Updating station: ${station.title}`);
    _.extend(station, parsedUpdate.station);
    return station.save().then(() => parsedUpdate.episodes);
  };
};

const createNewEpisodes = function createNewEpisodes(station) {
  return parsedUpdateEpisodes => Podcast.find({ station: station._id })
    .then(episodes => _.differenceBy(parsedUpdateEpisodes, episodes, 'guid')
      .map(newEpisode => Object.assign(newEpisode, { station })))
    .then(newEpisodes => {
      if (newEpisodes.length) {
        logger.info(`Creating ${newEpisodes.length} podcasts for ${station.title}...`);
        return Podcast.create(newEpisodes);
      }
      return null;
    });
};

const updateStation = function updateStation(station) {
  return () => utils.fetch(station.feed)
    .then(applyStationUpdate(station))
    .then(createNewEpisodes(station))
    .catch(logger.error);
};

const update = function update() {
  return Station.find({})
    .then(stations => stations.reduce((p, c) => p.then(updateStation(c)), Promise.resolve()));
};

module.exports = { update };
