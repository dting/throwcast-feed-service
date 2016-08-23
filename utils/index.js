const logger = require('winston');
const parsePodcast = require('node-podcast-parser');
const request = require('request');
const _ = require('lodash');

const { Podcast, Station } = require('../db');

const fetch = function fetch(feed) {
  return new Promise((resolve, reject) => {
    request(feed, (networkErr, res, xmlData) => {
      if (networkErr) {
        logger.error('Network Error', networkErr);
        return reject(networkErr);
      }

      return parsePodcast(xmlData, (parsingErr, jsonData) => {
        if (parsingErr) {
          logger.error('Parsing error', parsingErr);
          return reject(parsingErr);
        }

        const {
          categories,
          title,
          link,
          updated,
          description,
          image,
          episodes,
        } = jsonData;
        return resolve({
          station: {
            title,
            link,
            updated,
            description,
            image,
            categories,
            feed,
          },
          episodes,
        });
      });
    });
  });
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
      logger.debug(`No podcasts to add for ${station.title}...`);
      return null;
    });
};

const clean = function clean() {
  return Station.remove()
    .then(() => Podcast.remove());
};

module.exports = { clean, fetch, updateEpisodes };
