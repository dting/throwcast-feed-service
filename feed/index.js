const logger = require('winston');
const _ = require('lodash');

const utils = require('../utils');
const { Station, Podcast } = require('../db');

const updateStation = function updateStation(doc) {
  return ({ station, episodes }) => {
    if (doc.updated.valueOf() === station.updated.valueOf()) {
      logger.info(`No station changes for: ${doc.title}`);
      return { station: doc, episodes };
    }
    logger.info(`Updating station: ${station.title}`);
    _.extend(doc, station);
    return doc.save().then(saved => ({ station: saved, episodes }));
  };
};

const updateEpisodes = function updateEpisodes({ station, episodes }) {
  return Podcast.find({ station: station._id })
    .then(existing => _.differenceBy(episodes, existing, 'guid'))
    .then(podcasts => podcasts.map(podcast => {
      const props = { station, image: podcast.image || station.image };
      return Object.assign(podcast, props);
    }))
    .then(podcasts => {
      if (podcasts.length) {
        logger.info(`Creating ${podcasts.length} podcasts for ${station.title}...`);
        return Podcast.create(podcasts);
      }
      return null;
    });
};

const stationHandler = function(p, station) {
  return p.then(() => utils.fetch(station.feed))
    .then(updateStation(station))
    .then(updateEpisodes);
};

const update = function update() {
  return Station.find({})
    .then(stations => stations.reduce(stationHandler, Promise.resolve()))
    .catch(logger.error);
};

module.exports = { update };
